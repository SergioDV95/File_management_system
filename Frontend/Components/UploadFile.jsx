import { useState, useEffect, useRef } from 'react';
import axios from './Configs/AxiosConfig';

export default function UploadFile() {
   const [input, setInput] = useState({
      filename: '',
      files: ''
   });
   const [error, setError] = useState()
   const button = useRef(null);
   const fileSubmit = async (e) => {
      e.preventDefault();
      try {
         const response = await axios.post('/files/multiple', input);
         if (response.status === 200) {
            alert('Archivos cargados con éxito');
            setInput({
               filename: '',
               files: ''
            });
         }
      } catch ({response, name, message}) {
         console.log(name, message);
      }
   }

   useEffect(() => {
      validateFile();
   }, [input.files]);

   const validateFile = () => {
      let isValid = true;
      if (input.files.length > 0) {
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
         isValid = false;
      }
      button.current.disabled = !isValid;
   }

   return(
      <form onSubmit={fileSubmit} name='fileUpload'>
         <label htmlFor='filename'>Nombre del archivo:</label>
         <input 
            id='filename'
            type="text" 
            value={input.filename}
            onChange={(e) => setInput((input) => ({...input, filename: e.target.value}))}
         />
         <label htmlFor='selectFile'>Selecciona un archivo:</label>
         <input
            id='selectFile'
            type="file"
            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf, image/*'
            multiple
            onChange={(e) => setInput((input) => {
               if (e.target.files.length >= 1) {
                  let filesArray = [];
                  for(const file of e.target.files) {
                     filesArray.push(file);
                  }
                  return {...input, files: filesArray};
               }
            })}
         />
         <div className='relative'>
            <p className='absolute'>{error}</p>
         </div>
         <div className='flex flex-col'>
            {input.files && input.files.map((file, index) => {
               return (
                  <div key={index} className='flex justify-around'>
                     <p>{file.name}</p>
                     <p>{file.size}</p>
                     <p>{file.type}</p>
                     <input type="image" src="" alt="Quitar archivo" onClick={() => {
                        let filesArray = Array.from(input.files)
                        filesArray.splice(index, 1);
                        setInput((input) => ({...input, files: filesArray}));
                     }} />
                  </div>
               )
            })}
         </div>
         <button type="submit" ref={button}>Subir archivo</button>
      </form>
   )
}