import { useState, useEffect } from 'react';
import axios from './Configs/AxiosConfig';

export default function Files() {
   const [files, setFiles] = useState([]);
   const [error, setError] = useState({
      name: ''
   });
   useEffect(() => {
      const getFiles = async () => {
         try {
            const response = await axios.get('/files');
            if (response.status === 200) {
               setFiles(response.data);
            }
         } catch ({response}) {
            const { name, message } = response.data;
            if (response.data) {
               setError((error) => ({...error, [name]: message}));
            }
         }
      };
      getFiles();
   }, []);
   return (
      <>
      {files && files.map((file) => {
         return (
            <li key={file._id}>
               <p>{file.name}</p>
               <p>{file.size}</p>
               <p>{file.mimetype}</p>
               <p>{file.encoding}</p>
            </li>
         )
      })}
      </>
   )
}