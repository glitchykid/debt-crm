from django.urls import path

from .views import (
    DebtorDetailView,
    DebtorListCreateView,
    DebtorPaymentDetailView,
    DebtorPaymentListCreateView,
    DebtorStatusUpdateView,
)

urlpatterns = [
    path("debtors", DebtorListCreateView.as_view(), name="debtor-list-create"),
    path("debtors/<uuid:debtor_id>", DebtorDetailView.as_view(), name="debtor-detail"),
    path("debtors/<uuid:debtor_id>/payments", DebtorPaymentListCreateView.as_view(), name="debtor-payment-create"),
    path(
        "debtors/<uuid:debtor_id>/payments/<uuid:payment_id>",
        DebtorPaymentDetailView.as_view(),
        name="debtor-payment-delete",
    ),
    path("debtors/<uuid:debtor_id>/status", DebtorStatusUpdateView.as_view(), name="debtor-status-update"),
]
