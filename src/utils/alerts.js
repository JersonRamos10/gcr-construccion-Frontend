import Swal from "sweetalert2";

// Notificación pequeña tipo "Toast" (esquina superior derecha)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showAlert = (icon, title) => {
  Toast.fire({
    icon: icon, // 'success', 'error', 'warning', 'info'
    title: title
  });
};

// Modal de confirmación para eliminar
export const showConfirm = async (title, text, confirmButtonText = "Sí, eliminar") => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33", 
    cancelButtonColor: "#3085d6", 
    confirmButtonText: confirmButtonText,
    cancelButtonText: "Cancelar",
    reverseButtons: true, 
    focusCancel: true 
  });
  return result.isConfirmed;
};