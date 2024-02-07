import React, { useState, useEffect, useRef, useContext } from 'react';
import filesUp from './Configs/Context';
import axios from './Configs/AxiosConfig';

export default function UploadFile() {
   const {setFilesUploaded} = useContext(filesUp);
   //Estados
   //manejo de archivos
   const [input, setInput] = useState({
      files: []
   });
   //manejo de error
   const [error, setError] = useState('')
   //visualiza el párrafo de soltar archivos si está en true
   const [dragging, setDragging] = useState(false);
   //visualiza el botón de quitar archivo al pasar el cursor
   const [hoverIndex, setHoverIndex] = useState(null);

   //Referencias
   //contador para visualizar el párrafo al arrastrar los archivos, si es >=1 se muestra y de lo contrario no
   const dragCounter = useRef(0);
   //botón del submit
   const buttonRef = useRef();
   //contenedor de los archivos
   const dropRef = useRef();
   //input type='file'
   const inputRef = useRef();

   //Funciones
   
   //Métodos del drag and drop
   const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
   };

   //Cuando se arrastren los archivos dentro del formulario se visualiza un párrafo de soltar
   const handleDragIn = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
         setDragging(true);
      }
   };

   //Lo contrario de la función anterior
   const handleDragOut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
         setDragging(false);
      }
   };
   
   //Soltar los archivos en el formulario los agrega al estado input
   const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      /*Soltar los archivos reiniciará el contador*/
      dragCounter.current = 0;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         setInput((input) => ({ files: [...input.files, ...e.dataTransfer.files] }));
         e.dataTransfer.clearData();
      }
   };

   //método POST al servidor
   const fileSubmit = async (e) => {
      e.preventDefault();
      try {
         if (input.files.length > 0) {
            /*instancia del objeto FormData para enviar los archivos 'multipart/form-data'*/
            const formData = new FormData();
            input.files.forEach((value) => {
               formData.append('files', value);
            })
            const response = await axios.post('/files', formData);
            if (response.status === 200) {
               alert('Archivos cargados con éxito');
               setFilesUploaded((files) => [...files, input.files.length]);
               setInput({
                  files: []
               });
            }
         }
      } catch ({ response, name, message }) {
         console.log(name, message);
      }
   }

   //validación de archivos (tipos, tamaños y límites)
   const validateFile = () => {
      let isValid = true;
      if (input && input.files.length > 0 && input.files.length <= 10) {
         for (const file of input.files) {
            if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
            file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
            file.type !== "application/pdf" &&
            !file.type.startsWith("image")) {
               /*si algún archivo es del tipo incorrecto, se detiene la validación y muestra error*/
               setError("Solo archivos Word, Excel, PDF o de imagen");
               isValid = false;
               break;
            } else if (file.size > 1000 * 1000 * 30) {
               /*si algún archivo excede el tamaño, se detiene la validación y muestra error*/
               setError("El archivo (o uno de ellos) es mayor de 30 MB");
               isValid = false;
               break;
            } else {
               setError("");
            }
         }
      } else if (input && input.files.length > 10) {
         /*si se excede el límite de archivos, muestra error*/
         setError("Límite de archivos excedido");
         isValid = false;
      } else {
         setError("");
         isValid = false;
      }
      /*si los archivos pasan la validación, se habilita botón del submit*/
      buttonRef.current.disabled = !isValid;
   }

   //conversión de Bytes a KB o MB
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

   //Efectos
   //eventos para arrastrar los archivos
   useEffect(() => {
      let form = dropRef.current;
      form.addEventListener('dragenter', handleDragIn);
      form.addEventListener('dragleave', handleDragOut);
      form.addEventListener('dragover', handleDrag);
      form.addEventListener('drop', handleDrop);
      return () => {
         form.removeEventListener('dragenter', handleDragIn);
         form.removeEventListener('dragleave', handleDragOut);
         form.removeEventListener('dragover', handleDrag);
         form.removeEventListener('drop', handleDrop);
      };
   });

   //ejecutar la validación de archivos cuando el input cambie
   useEffect(() => {
      validateFile();
   }, [input]);

   return (
      <form onSubmit={fileSubmit} className='shadow-[0_8px_10px_1px_#00000026] relative flex flex-col gap-[25px] p-[25px] bg-[#E9ECEF] w-[400px] h-fit rounded-[25px] items-center' name='fileUpload' ref={dropRef} onClick={(e) => e.stopPropagation()}>
         {dragging &&
            <div>
               <p>Suelta los archivos aquí</p>
            </div>
         }
         <div className='w-[100px] h-[100px] flex items-center justify-center cursor-pointer bg-[#6AB547] rounded-full text-center shadow-button' onClick={() => inputRef.current.click()}>
            <p className='text-[6rem] font-medium text-white'>+</p>
         </div>
         <div className='flex flex-col gap-[10px] w-full'>
            <label htmlFor='selectFile' className='flex flex-col items-center'>
               <span className='text-[20px]'>Selecciona los archivos</span>
               <span className='text-[15px]'>o arrástralos</span>
            </label>
            <div className='relative flex justify-center text-[12px]'>
               <p className='error'>{error}</p>
            </div>
         </div>
         <div className='border-[#CED4DA] border-y-[1px] w-full'></div>
         {/*input de tipo file oculto*/}
         <input
            className='hidden'
            ref={inputRef}
            id='selectFile'
            type="file"
            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, image/*'
            multiple
            onChange={(e) => setInput((input) => {
               if (e.target.files.length > 0) {
                  let filesArray = [];
                  for (const file of e.target.files) {
                     filesArray.push(file);
                  }
                  return { files: [...input.files, ...filesArray] };
               }
            })}
         />
         <menu className='flex flex-col gap-[8px] text-[10px] max-h-[150px] w-full overflow-y-auto'>
            {/*visualizar lor archivos seleccionados*/}
            {input && input.files.map((file, index) => {
               return (
                  <li 
                     key={index} 
                     className='relative grid h-[2em] [grid-template-columns:1fr_0.7fr_1fr_0.1fr] gap-[10px]'
                     onMouseEnter={() => {setHoverIndex(index)}}
                     onMouseLeave={() => {setHoverIndex(null)}}
                  >
                     <p className='overflow-hidden whitespace-nowrap text-ellipsis'>{file.name}</p>
                     <p>{convertSize(file.size)}</p>
                     <p className='overflow-hidden whitespace-nowrap text-ellipsis'>{file.type}</p>
                     <div
                        className={`${hoverIndex === index ? "flex" : "hidden"} absolute right-0 cursor-pointer text-[10px] text-[#c93d3d] font-semibold border-[2px] border-[#c93d3d] leading-3 justify-center items-center h-fit w-[15px] rounded-full`}
                        onClick={() => {
                           let filesArray = [...input.files];
                           filesArray.splice(index, 1);
                           setInput((input) => ({ ...input, files: filesArray }));
                        }}
                     >X</div>
                  </li>
               )
            })}
         </menu>
         <div className='flex justify-center relative w-full'>
            <button className='enabled:shadow-button cursor-pointer disabled:cursor-default disabled:opacity-40 bg-[#00B4D8] text-white w-[135px] h-[50px] rounded-[25px]' type="submit" ref={buttonRef}>Subir</button>
            {input.files.length > 0 && <p className={`absolute right-0 text-[12px] ${input.files.length > 10 ? 'text-[#FF0000]' : 'text-[#6AB547]'}`}>{input.files.length}/10</p>}
         </div>
      </form>
   )
}