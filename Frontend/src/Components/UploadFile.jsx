import { useState, useEffect, useRef } from 'react';
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
      if (input && input.files.length > 0) {
         input.files.forEach((file) => {
            if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
               file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
               file.type !== "application/pdf" &&
               !file.type.startsWith("image")) {
               setError("Solo archivos de Word, Excel, PDF o de tipo imagen");
               isValid = false;
            } else if (file.size > 1000 * 1000 * 30) {
               setError("El archivo (o uno de ellos) es mayor de 30MB");
               isValid = false;
            } else {
               setError("");
            }
         })
      } else {
         setError("");
         isValid = false;
      }
      buttonRef.current.disabled = !isValid;
   }

   return (
      <div className='flex justify-center items-center bg-blue_bg bg-no-repeat bg-cover w-screen h-screen '>
         <form onSubmit={fileSubmit} className='relative flex flex-col gap-[25px] p-[25px] bg-[#E9ECEF] w-[400px] h-[400px] rounded-[25px] items-center' name='fileUpload' ref={dropRef}>
            {dragging &&
               <div>
                  <p>Suelta tus archivos aquí</p>
               </div>
            }
            <div className='w-[100px] h-[100px] flex items-center justify-center cursor-pointer bg-[#6AB547] rounded-full text-center ' onClick={() => inputRef.current.click()}>
               <p className='text-[6rem] font-medium text-white'>+</p>
            </div>
            <label htmlFor='selectFile' className='flex flex-col items-center'>
               <span className='text-[20px]'>Selecciona los archivos</span>
               <span className='text-[13px]'>o arrástralos</span>
            </label>
            <div className='border-[#CED4DA] border-y-[1px] w-full '></div>
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
            <div className='relative'>
               <p className='error'>{error}</p>
            </div>
            <div className='flex flex-col'>
               {input && input.files.map((file, index) => {
                  return (
                     <div key={index} className='flex justify-around'>
                        <p>{file.name}</p>
                        <p>{file.size}</p>
                        <p>{file.type}</p>
                        <input type="image" src="" alt="Quitar archivo" onClick={() => {
                           let filesArray = [...input.files];
                           filesArray.splice(index, 1);
                           setInput((input) => ({ ...input, files: filesArray }));
                        }} />
                     </div>
                  )
               })}
            </div>
            <button className='absolute bottom-[25px] enabled:shadow-[0_4px_4px_0_#00000040] cursor-pointer disabled:cursor-default disabled:opacity-40 bg-[#00B4D8] text-white w-[135px] h-[50px] rounded-[25px]' type="submit" ref={buttonRef}>Subir</button>
         </form>
      </div>
   )
}