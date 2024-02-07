import UploadFile from './UploadFile';
import Files from './Files';
import { useRef, useState } from 'react';

export default function Layout() {
   const dialogRef = useRef();
   const [justify, setJustify] = useState('justify-center');

   const handleButtonClick = (e) => {
      e.stopPropagation();
      dialogRef.current.show();
      setJustify('justify-between');
   };

   const handleSectionClick = () => {
      if (dialogRef.current.open) {
         dialogRef.current.close();
         setJustify('justify-center');
      };
   }

   return (
      <section className='relative flex flex-col bg-blue_bg bg-no-repeat bg-fixed bg-cover w-screen h-screen px-[50px]' onClick={handleSectionClick}>
         <div className='flex justify-end items-center h-[10%]'>
            <button type='button' className='absolute h-[50px] w-[135px] bg-[#F8F9FA] rounded-[25px] shadow-[0_4px_3px_1px_#00000026]' onClick={handleButtonClick}>Archivos</button>
            <dialog className='absolute mr-0 w-[60%] right-0 top-0 h-screen bg-[#F8F9FA] text-[12px] rounded-[25px] shadow-[-4px_1px_4px_1px_#00000026]' onClick={(e) => e.stopPropagation()} ref={dialogRef}>
               <Files />
            </dialog>
         </div>
         <div className={`flex ${justify} items-center h-[90%]`}>
            <UploadFile />
         </div>
      </section>
   );
}