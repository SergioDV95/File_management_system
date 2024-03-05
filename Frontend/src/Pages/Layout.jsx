import FilesUpload from "../Components/FilesUpload";
import FilesDisplay from "../Components/FilesDisplay";
import { useRef, useState } from "react";
import axios from "axios";

export default function Layout() {
  //referencia a la ventana del dialog
  const dialogRef = useRef();
  //controla la justificación del formulario
  const [justify, setJustify] = useState("justify-center");

  //Funciones
  //abre la ventana del dialog y evita la propagación del clic
  const handleButtonClick = (e) => {
    e.stopPropagation();
    dialogRef.current.show();
    setJustify("justify-between");
  };

  //cierra la ventana del dialog
  const handleSectionClick = () => {
    if (dialogRef.current.open) {
      dialogRef.current.close();
      setJustify("justify-center");
    }
  };

  const handleLogoutButtonClick = () => {
    try {
      axios.post("http://localhost:3004/auth/logout");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  return (
    <section
      className="relative flex flex-col bg-blue_bg bg-no-repeat bg-fixed bg-cover w-screen h-screen px-[50px]"
      onClick={handleSectionClick}
    >
      <div className="flex justify-end items-center h-[10%]">
        <div className="flex">
          {/* Botón de archivos */}
          <button
            type="button"
            className="h-[50px] w-[135px] bg-[#F8F9FA] rounded-[25px] shadow-[0_4px_3px_1px_#00000026] mr-4"
            onClick={handleButtonClick}
          >
            Archivos
          </button>
          {/* Botón de logout */}
          <button
            type="button"
            className="h-[50px] w-[135px] bg-red-700 text-white rounded-[25px] shadow-[0_4px_3px_1px_#00000026]"
            onClick={handleLogoutButtonClick}
          >
            Logout
          </button>
        </div>

        <dialog
          className="absolute mr-0 w-[60%] right-0 top-0 h-screen bg-[#F8F9FA] text-[12px] rounded-l-[25px] shadow-[-4px_1px_4px_1px_#00000026]"
          onClick={(e) => e.stopPropagation()}
          ref={dialogRef}
        >
          <FilesDisplay />
        </dialog>
      </div>
      <div className={`flex ${justify} items-center h-[90%]`}>
        <FilesUpload />
      </div>
    </section>
  );
}
