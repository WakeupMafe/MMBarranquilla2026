import Swal from "sweetalert2";

export const alertOk = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
  });

export const alertError = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Entendido",
  });

export const alertConfirm = async ({
  title,
  text,
  confirmText = "Sí",
  cancelText = "Cancelar",
}) => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};
