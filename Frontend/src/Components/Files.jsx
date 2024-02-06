import React, { useState, useEffect } from 'react';
import axios from './Configs/AxiosConfig';

export default function Files() {
   const [files, setFiles] = useState([]);
   const [error, setError] = useState({
      name: ''
   });
   const [fileRef, setFileRef] = useState([]);

   useEffect(() => {
      setFileRef((refs) => new Array(files.length).fill().map((_, index) => refs[index] || React.createRef()));
   }, [files]);

   useEffect(() => {
      const getFiles = async (name) => {
         try {
            const query = name ? `?name=${name}` : '';
            const response = await axios.get(`/files${query}`);
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
   }, []);

   const deleteFile = async (_id) => {
      try {
         const response = await axios.delete(`/files`, {id: _id});
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

   return (
      <>
      <div className='flex flex-col gap-2'>
      {files && files.map((file) => {
         return (
            <li className='flex justify-around' key={file._id}>
               <div>
                  <p>{file.name}</p>
                  <p>{file.size}</p>
                  <p>{file.mimetype}</p>
                  <p>{file.encoding}</p>
               </div>
               <div>
                  <input type='image' src='' onClick={() => deleteFile(file._id)} />
               </div>
            </li>
         )
      })}
      </div>
      </>
   )
}