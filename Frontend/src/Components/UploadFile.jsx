import React, { useState, useEffect, useRef } from 'react';
import axios from './Configs/AxiosConfig';

export default function UploadFile() {
   const [input, setInput] = useState({
      files: []
   });
   const [error, setError] = useState('')
   const [dragging, setDragging] = useState(false);
   const dragCounter = useRef(0);
   const buttonRef = useRef();
   const dropRef = useRef();
   const inputRef = useRef();
   const [filesRef, setFilesRef] = useState([]);

   const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
   };

   const handleDragIn = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
         setDragging(true);
      }
   };

   const handleDragOut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
         setDragging(false);
      }
   };

   const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      dragCounter.current = 0;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         setInput((input) => ({
            files: [...input.files, ...e.dataTransfer.files],
         }))
         e.dataTransfer.clearData();
      }
   };

   useEffect(() => {
      setFilesRef((refs) => new Array(input.files.length).fill().map((_, index) => refs[index] || React.createRef()));
   }, [input.files]);

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

   const fileSubmit = async (e) => {
      e.preventDefault();
      try {
         if (input.files.length > 0) {
            const formData = new FormData();
            input.files.forEach((value) => {
               formData.append('files', value);
            })
            const response = await axios.post('/files', formData);
            if (response.status === 200) {
               alert('Archivos cargados con éxito');
               setInput({
                  files: []
               });
            }
         }
      } catch ({ response, name, message }) {
         console.log(name, message);
      }
   }

   useEffect(() => {
      validateFile();
   }, [input]);

   const validateFile = () => {
      let isValid = true;
      if (input && input.files.length > 0 && input.files.length <= 10) {
         for(const file of input.files) {
            if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
               file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
               file.type !== "application/pdf" &&
               !file.type.startsWith("image")) {
               setError("Solo archivos Word, Excel, PDF o de imagen");
               isValid = false;
               break;
            } else if (file.size > 1000 * 1000 * 30) {
               setError("El archivo (o uno de ellos) es mayor de 30 MB");
               isValid = false;
               break;
            } else {
               setError("");
            }
         }
      } else {
         setError("");
         isValid = false;
      }
      buttonRef.current.disabled = !isValid;
   }

   const convertSize = (bytes) => {
      let divider;
      let size;
      switch (true) {
         case bytes.toString().length < 4:
            divider = 1;
            size = 'Bytes';
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

   return (
      <div className='flex justify-center items-center bg-blue_bg bg-no-repeat bg-cover w-screen h-screen '>
         <form onSubmit={fileSubmit} className='relative flex flex-col gap-[25px] p-[25px] bg-[#E9ECEF] w-[400px] h-fit rounded-[25px] items-center' name='fileUpload' ref={dropRef}>
            {dragging &&
               <div>
                  <p>Suelta tus archivos aquí</p>
               </div>
            }
            <div className='w-[100px] h-[100px] flex items-center justify-center cursor-pointer bg-[#6AB547] rounded-full text-center' onClick={() => inputRef.current.click()}>
               <p className='text-[6rem] font-medium text-white'>+</p>
            </div>
            <div className='flex flex-col gap-[10px] w-full'>
               <label htmlFor='selectFile' className='flex flex-col items-center'>
                  <span className='text-[20px]'>Selecciona los archivos</span>
                  <span className='text-[13px]'>o arrástralos</span>
               </label>
               <div className='relative flex justify-center text-[12px]'>
                  <p className='error'>{error}</p>
               </div>
            </div>
            <div className='border-[#CED4DA] border-y-[1px] w-full'></div>
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
                     return { ...input, files: filesArray };
                  }
               })}
            />
            <menu className='flex flex-col gap-[5px] text-[10px] max-h-[150px] w-full overflow-y-auto'>
               {input && input.files.map((file, index) => {
                  return (
                     <li key={index} ref={filesRef[index]} className='relative grid h-[2em] [grid-template-columns:1fr_0.7fr_1fr_0.1fr] gap-[10px]'>
                        <p className='overflow-hidden whitespace-nowrap text-ellipsis'>{file.name}</p>
                        <p>{convertSize(file.size)}</p>
                        <p className='overflow-hidden whitespace-nowrap text-ellipsis'>{file.type}</p>
                        <div className={`absolute right-0 cursor-pointer text-[10px] text-[#c93d3d] border-[2px] flex border-[#c93d3d] leading-3 justify-center items-center h-fit w-[15px] rounded-full`} onClick={() => {
                           let filesArray = [...input.files];
                           filesArray.splice(index, 1);
                           setInput((input) => ({ ...input, files: filesArray }));
                        }}>X</div>
                     </li>
                  )
               })}
            </menu>
            <div className='flex justify-center relative w-full'>
               <button className='enabled:shadow-[0_4px_4px_0_#00000040] cursor-pointer disabled:cursor-default disabled:opacity-40 bg-[#00B4D8] text-white w-[135px] h-[50px] rounded-[25px]' type="submit" ref={buttonRef}>Subir</button>
               {input.files.length > 0 && <p className={`absolute right-0 text-[12px] ${input.files.length > 10 ? 'text-[#c93d3d]' : 'text-[#6AB547]'}`}>{input.files.length}/10</p>}
            </div>
         </form>
      </div>
   )
}