import React, { useState, useEffect, useContext } from 'react';
import filesUp from './Configs/Context';
import axios from './Configs/AxiosConfig';
import { downloadSvg, trashSvg, wordSvg, excelSvg, pdfSvg, imageSvg } from '../exports';

export default function Files() {
   const {filesUploaded} = useContext(filesUp);
   const [files, setFiles] = useState([]);
   const [error, setError] = useState({
      name: ''
   });
   const [fileRef, setFileRef] = useState([]);

   useEffect(() => {
      setFileRef((refs) => new Array(files.length).fill().map((_, index) => refs[index] || React.createRef()));
   }, [files]);

   useEffect(() => {
      const getFiles = async () => {
         try {
            const response = await axios.get(`/files`);
            if (response.status === 200) {
               setFiles(response.data);
            }
         } catch ({response}) {
            if (response.data) {
               const { name, message } = response.data;
               setError((error) => ({...error, [name]: message}));
            }
         }
      };
      getFiles();
   }, [filesUploaded]);

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

   const downloadFile = async (file) => {
      try {
         const response = await axios.get(`/files?id=${file._id}`, { 
            responseType: 'blob' 
         });
         if (response.status === 200) {
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
               <li className='grid [grid-template-columns:3fr_1.5fr_1fr_repeat(2,0.3fr)] px-[30px] gap-[20px] justify-center items-center h-[50px] border-[#CED4DA] border-b-[1px] ' key={file._id}>
                  <figure className='flex items-center gap-[10px] '>
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
      </section>
   )
}