import { FaCrown } from "react-icons/fa";
import { useHomeContext } from '../../context/HomeContext';
import { port, theHost } from "../../config";

const PlayerStage = () => {
    const {data} = useHomeContext();

    const first = data[0];
    const second = data[1];
    const third = data[2];
	return(
		<div className='mobile:flex-1  justify-center items-center flex'>
                                    <div className=' flex h-[300px] max-w-[400px] flex-1  justify-center m-5'>
                                        <div className='flex  max-w-72 flex-1 gap-1 mx-5'>
                                                <div className='flex-1  flex flex-col'>
                                                    <div className='h-52 flex'>
                                                        <div className='flex flex-col items-center justify-end flex-1 '>
                                                            { second &&
                                                                <>
                                                                <div className='relative'>
                                                                    <div className='dark:border-black border-2 border-white absolute bg-black size-6 right-[-5px] top-[-5px] text-white justify-center flex items-center rounded-full text-sm font-bold dark:bg-white dark:text-black'>2</div>
                                                                    <img src={`${theHost}:${port}${second.profile_img}`} alt=""  className=' rounded-full w-16'/>
                                                                </div>
                                                                <div>{second.username}</div>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className='flex-1 rounded-t-3xl bg-[#666666]'></div>
                                                </div>
                                                <div className='flex-1  flex flex-col'>
                                                    <div className='h-36 flex '>
                                                        <div className='flex flex-col items-center justify-end flex-1'>
                                                            {
                                                                first && <>
                                                                <div className='text-2xl'><FaCrown/></div>
                                                                <div className='relative'>
                                                                    <div className=' dark:border-black border-2 border-white absolute bg-black size-6 right-[-5px] top-[-5px] text-white justify-center flex items-center rounded-full text-sm font-bold dark:bg-white dark:text-black'>1</div>
                                                                    <img src= {`${theHost}:${port}${first.profile_img}`} alt=""  className=' rounded-full w-16'/>
                                                                </div>
                                                                <div>{first.username}</div>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className='flex-1 rounded-t-3xl bg-black dark:bg-white'></div>
                                                </div>
                                                <div className='flex-1  flex flex-col'>
                                                    <div className='h-60 flex '>
                                                        <div className='flex flex-col items-center justify-end flex-1'>
                                                            {
                                                                third && <>
                                                                <div className='relative'>
                                                                    <div className=' dark:border-black border-2 border-white absolute bg-black size-6 right-[-5px] top-[-5px] text-white justify-center flex items-center rounded-full text-sm font-bold dark:bg-white dark:text-black'>3</div>
                                                                    <img src={`${theHost}:${port}${third.profile_img}`} alt=""  className=' rounded-full w-16'/>
                                                                </div>
                                                                <div>{third.username}</div>
                                                            </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className='flex-1 rounded-t-3xl bg-[#888888]'></div>
                                                </div>

                                        </div>
                                    </div>
                               </div>
	)
}

export default PlayerStage