from uuid import UUID

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Debtor, DebtorStatus, Payment
from .serializers import AddPaymentSerializer, CreateDebtorSerializer, UpdateStatusSerializer
from .services import serialize_debtor_details, serialize_debtor_summary, sync_status_with_snapshot, sync_statuses


class DebtorListCreateView(APIView):
    def get(self, request):
        debtors = list(Debtor.objects.all())
        sync_statuses(debtors)
        payload = [serialize_debtor_summary(debtor) for debtor in debtors]
        return Response(payload, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateDebtorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        debtor = serializer.save()
        sync_status_with_snapshot(debtor)
        return Response(serialize_debtor_details(debtor), status=status.HTTP_201_CREATED)


class DebtorDetailView(APIView):
    def get(self, request, debtor_id: UUID):
        debtor = get_object_or_404(Debtor, id=debtor_id)
        sync_status_with_snapshot(debtor)
        return Response(serialize_debtor_details(debtor), status=status.HTTP_200_OK)

    def delete(self, request, debtor_id: UUID):
        debtor = get_object_or_404(Debtor, id=debtor_id)
        debtor.delete()
        return Response({"success": True}, status=status.HTTP_200_OK)


class DebtorPaymentListCreateView(APIView):
    @transaction.atomic
    def post(self, request, debtor_id: UUID):
        debtor = get_object_or_404(Debtor, id=debtor_id)
        serializer = AddPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        Payment.objects.create(
            debtor=debtor,
            amount=serializer.validated_data["amount"],
            date=serializer.validated_data["date"],
        )
        sync_status_with_snapshot(debtor)
        debtor.refresh_from_db()
        return Response(serialize_debtor_details(debtor), status=status.HTTP_201_CREATED)


class DebtorPaymentDetailView(APIView):
    @transaction.atomic
    def delete(self, request, debtor_id: UUID, payment_id: UUID):
        debtor = get_object_or_404(Debtor, id=debtor_id)
        payment = get_object_or_404(Payment, id=payment_id, debtor=debtor)
        payment.delete()
        sync_status_with_snapshot(debtor)
        debtor.refresh_from_db()
        return Response(serialize_debtor_details(debtor), status=status.HTTP_200_OK)


class DebtorStatusUpdateView(APIView):
    def patch(self, request, debtor_id: UUID):
        debtor = get_object_or_404(Debtor, id=debtor_id)
        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # KISS: keep close flow explicit. Additional status transitions can be expanded later.
        if serializer.validated_data["status"] != DebtorStatus.SETTLED:
            return Response(
                {"message": "Only settled status is supported by this endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        debtor.status = DebtorStatus.SETTLED
        debtor.save(update_fields=["status", "updated_at"])
        return Response(serialize_debtor_details(debtor), status=status.HTTP_200_OK)
