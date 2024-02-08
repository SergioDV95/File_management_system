import React, { useState, useEffect, useContext } from 'react';
import filesUp from './Configs/Context';
import axios from './Configs/AxiosConfig';
import { downloadSvg, trashSvg, wordSvg, excelSvg, pdfSvg, imageSvg } from '../exports';

export default function FilesDisplay() {
   //contexto para actualizar la lista al subir nuevos archivos
   const {filesUploaded} = useContext(filesUp);
   //estado para mostrar los archivos
   const [files, setFiles] = useState([]);
   //estado para la paginación
   const [pagination, setPagination] = useState({});

   //efectos
   //efecto que vuelve a ejecutar la función cuando se actualiza la lista de archivos
   useEffect(() => {
      getFiles();
   }, [filesUploaded]);
   
   //funciones
   //traer los archivos del servidor y definir la paginación
   const getFiles = async (pag) => {
      try {
         const page = pag ? `?page=${pag}` : '';
         const response = await axios.get(`/files${page}`);
         if (response.status === 200) {
            setFiles([...response.data.docs]);
            setPagination({...response.data});
         }
      } catch ({response}) {
         if (response.data) {
            const { name, message } = response.data;
            setError((error) => ({...error, [name]: message}));
         }
      }
   };

   //seleccionar icono del archivo por su tipo
   const selectIcon = (file) => {
      let src;
      if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
         src = excelSvg;
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
         src = wordSvg;
      } else if (file.mimetype === "application/pdf") {
         src = pdfSvg;
      } else if (file.mimetype.startsWith("image")) {
         src = imageSvg;
      }
      return <img src={src} alt={file.name} />
   }

   //convertir tipo de archivo a una palabra clave más fácil de identificar
   const convertType = (mime) => {
      let type;
      if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
         type = "EXCEL";
      } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
         type = "WORD";
      } else if (mime === "application/pdf") {
         type = "PDF";
      } else if (mime.startsWith("image")) {
         if (mime === "image/jpeg") {
            type = "JPEG";
         } else if (mime === "image/png") {
            type = "PNG";
         } else if (mime === "image/gif") {
            type = "GIF";
         } else if (mime === "image/bmp") {
            type = "BMP";
         } else if (mime === "image/tiff") {
            type = "TIFF";
         } else if (mime === "image/webp") {
            type = "WEBP";
         } else {
            type = "IMAGEN";
         }
      }
      return type
   }

   //convertir tamaño del archivo dependiendo de su peso en Bytes
   const convertSize = (bytes) => {
      let divider;
      let size;
      switch (true) {
         case bytes.toString().length < 4:
            divider = 1;
            size = 'B';
            break;
         case bytes.toString().length >= 4 && bytes.toString().length < 7:
            divider = 1000;
            size = 'KB';
            break;
         case bytes.toString().length >= 7:
            divider = 1000000;
            size = 'MB';
            break;
      }
      return (bytes / divider).toFixed(2) + ' ' + size
   }

   //borrar el archivo del servidor
   const deleteFile = async (_id) => {
      try {
         const response = await axios.delete(`/files?_id=${_id}`);
         if (response.status === 200) {
            setFiles(files.filter((file) => file._id !== _id));
         }
      } catch ({response}) {
         if (response.data) {
            const { name, message } = response.data;
            setError((error) => ({...error, [name]: message}));
         }
      }
   }

   //descargar el archivo
   const downloadFile = async (file) => {
      try {
         const response = await axios.get(`/files?id=${file._id}`, { 
            responseType: 'blob' 
         });
         if (response.status === 200) {
            /*instanciar un objeto Blob que reciba la respuesta del servidor y un objeto URL apartir de él,
             para asociar con el elemento del hipervínculo creado*/
            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            URL.revokeObjectURL(url);
         }
      } catch ({response}) {
         if (response.data) {
            console.error(response.data);
         }
         
      }
   }

   return (
      <section className='flex flex-col gap-[20px]'>
         <div className='flex px-[30px] items-center w-full border-[#CED4DA] border-b-[1px] h-[85px] '>
            <h4>ARCHIVOS SUBIDOS</h4>
         </div>
         <menu className='flex flex-col text-[11px]'>
            <li className='grid [grid-template-columns:3fr_1.5fr_1fr_0.8fr] px-[30px] gap-[20px] justify-center items-center text-[#C0C0C0] h-[50px] border-[#CED4DA] border-b-[1px] '>
               <p>NOMBRE</p>
               <p>TIPO</p>
               <p>PESO</p>
               <p>OPCIONES</p>
            </li>
         {files && files.map((file) => {
            return (
               <li className='grid [grid-template-columns:3fr_1.5fr_1fr_repeat(2,0.3fr)] px-[30px] gap-[20px] justify-center items-center h-[3lh] border-[#CED4DA] border-b-[1px] ' key={file._id}>
                  <figure className='flex items-center gap-[10px] [overflow-wrap:anywhere] h-full '>
                     {selectIcon(file)}
                     <p>{file.name}</p>
                  </figure>
                  <p>{convertType(file.mimetype)}</p>
                  <p>{convertSize(file.size)}</p>
                  <button className='flex justify-center items-center rounded-full w-fit px-[6px] h-[35px] bg-[#00B4D8] gap-[5px] shadow-button' onClick={() => downloadFile(file)}>
                     <img src={downloadSvg} alt="Descarga" />
                  </button>
                  <div className='flex justify-center items-center rounded-full w-fit px-[8px] h-[35px] bg-[#F41B05] shadow-button'>
                     <input type='image' src={trashSvg} alt='Eliminar' onClick={() => deleteFile(file._id)} />
                  </div>
               </li>
            )
         })}
         </menu>
         <div className='flex justify-between items-end gap-[15px] px-[30px]'>
            {Object.keys(pagination).length > 0 && <p>Página {pagination.page} de {pagination.totalPages}</p>}
            <div className='flex gap-[15px]'>
               <button className='h-[50px] w-[135px] bg-[#e9e9e9] rounded-[25px] shadow-[0_4px_3px_1px_#00000026]' onClick={() => getFiles(pagination.prevPage)}>Anterior</button>
               <button className='h-[50px] w-[135px] bg-[#e9e9e9] rounded-[25px] shadow-[0_4px_3px_1px_#00000026]' onClick={() => getFiles(pagination.nextPage)}>Siguiente</button>
            </div>
         </div>
      </section>
   )
}