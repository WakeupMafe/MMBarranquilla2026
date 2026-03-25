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

export const alertSelect = async ({
  title,
  text = "",
  inputOptions = {},
  inputPlaceholder = "Selecciona una opción",
  confirmButtonText = "Continuar",
  cancelButtonText = "Cancelar",
}) => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    input: "select",
    inputOptions,
    inputPlaceholder,
    inputAttributes: {
      "aria-label": inputPlaceholder,
    },
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    inputValidator: (value) => {
      if (!value) {
        return "Debes seleccionar una opción";
      }
      return undefined;
    },
  });

  if (!result.isConfirmed) {
    return null;
  }

  return result.value;
};
