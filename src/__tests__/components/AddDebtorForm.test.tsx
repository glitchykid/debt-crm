/**
 * TDD: AddDebtorForm — тестируем поведение UI, не детали реализации.
 * Тестируем: рендер, вызов action, отображение снэкбара.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddDebtorForm from "@/components/AddDebtorForm";

// Мок Server Action
jest.mock("@/actions/debtors", () => ({
  createDebtorAction: jest.fn(),
}));

// Мок notistack
const enqueueMock = jest.fn();
jest.mock("notistack", () => ({
  useSnackbar: () => ({ enqueueSnackbar: enqueueMock }),
}));

// Мок MUI DatePicker (тяжёлый, заменяем на простой input)
jest.mock("@mui/x-date-pickers", () => ({
  DatePicker: ({ label, name }: { label: string; name: string }) => (
    <input aria-label={label} name={name} />
  ),
}));

import { createDebtorAction } from "@/actions/debtors";
const mockCreateDebtorAction = createDebtorAction as jest.Mock;

describe("AddDebtorForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("рендерит поле ФИО", () => {
    render(<AddDebtorForm onSuccess={jest.fn()} />);
    expect(screen.getByLabelText(/ФИО/i)).toBeInTheDocument();
  });

  it("вызывает onSuccess при успешном добавлении", async () => {
    mockCreateDebtorAction.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();
    render(<AddDebtorForm onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole("button", { name: /добавить/i }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("показывает snackbar с ошибкой при провале", async () => {
    mockCreateDebtorAction.mockResolvedValueOnce({
      success: false,
      error: "Должник уже существует",
    });
    const onSuccess = jest.fn();
    render(<AddDebtorForm onSuccess={onSuccess} />);

    await userEvent.click(screen.getByRole("button", { name: /добавить/i }));

    expect(enqueueMock).toHaveBeenCalledWith(
      "Должник уже существует",
      expect.objectContaining({ variant: "error" }),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
