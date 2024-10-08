import { useCallback, useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../api/axiosAuth";

import RockIcon from '../../assets/rock.svg';
import ScissorsIcon from '../../assets/scissors.svg';
import PaperIcon from '../../assets/paper.svg';

import RockIcon2 from '../../assets/rock.png';
import ScissorsIcon2 from '../../assets/scissors.png';
import PaperIcon2 from '../../assets/paper.png';

import RockIcon3 from '../../assets/rock2.png';
import ScissorsIcon3 from '../../assets/scissors2.png';
import PaperIcon3 from '../../assets/paper2.png';
import { useNavbarContext } from "../../context/NavbarContext";


function RPSSettings() {
	const [selectedOption, setSelectedOption] = useState<number | null>(null);
	const {isWide} = useNavbarContext();

	const getOption = useCallback(async () => {
        try {
            const response = await axiosAuth.get(`sgame/get-option/`);
            const result = response.data;
            console.log('Fetched option:', result.game_option);
            setSelectedOption(result.game_option);
        } catch (error) {
            console.error('Error getting game option:', error);
        }
    }, []);

    useEffect(() => {
        getOption();
    }, [getOption]);

    const handleOptionChange = async (option: number) => {
        console.log('Changing option to:', option);
        setSelectedOption(option);
        try {
            await axiosAuth.post('sgame/set-option/', {
                option: option,
            });
            console.log('Option set successfully:', option);
        } catch (error) {
            console.error('Error posting game data:', error);
        }
    };

	return ( 
		<>
		{/* Settings o lhamaq*/}
		<div className='shrink mx-5	flex flex-col w-full items-center mt-5 max-w-96 pb-5'>
		{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center mb-5">Ping Pong Settings</div>}
        <div className='text-3xl font-bold text-center dark:text-white text-black'>Choose Your Hand</div>

        {/* option 1 */}
		<div className=" flex flex-col gap-4 pt-4">

        <div className='flex gap-4 justify-center items-center'>
            <input
                type="radio"
                id="option1"
                name="choice"
                value="1"
                checked={selectedOption == 1}
                onChange={() => handleOptionChange(1)}
                className="form-radio h-5 w-5 text-black focus:ring-black border-black"
				/>
            <label htmlFor="option1" className='flex gap-4'>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={RockIcon} alt={'Rock choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={PaperIcon} alt={'Paper choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={ScissorsIcon} alt={'Scissors choice'} className="w-16 h-16" />
                </div>
            </label>
        </div>

        {/* option 2 */}
        <div className='flex gap-4 justify-center items-center'>
            <input
                type="radio"
                id="option2"
                name="choice"
                value="2"
                checked={selectedOption == 2}
                onChange={() => handleOptionChange(2)}
                className="form-radio h-5 w-5 text-black focus:ring-black border-black"
				/>
            <label htmlFor="option2" className='flex gap-4'>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={RockIcon2} alt={'Rock choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={PaperIcon2} alt={'Paper choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={ScissorsIcon2} alt={'Scissors choice'} className="w-16 h-16" />
                </div>
            </label>
        </div>

        {/* option 3 */}
        <div className='flex gap-4 justify-center items-center'>
            <input
                type="radio"
                id="option3"
                name="choice"
                value="2"
                checked={selectedOption == 3}
                onChange={() => handleOptionChange(3)}
                className="form-radio h-5 w-5 text-black focus:ring-black border-black"
				/>
            <label htmlFor="option2" className='flex gap-4'>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={RockIcon3} alt={'Rock choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={PaperIcon3} alt={'Paper choice'} className="w-16 h-16" />
                </div>
                <div className='border-2 dark:border-white border-black max-w-[70px]'>
                    <img src={ScissorsIcon3} alt={'Scissors choice'} className="w-16 h-16" />
                </div>
            </label>
        </div>
				</div>
    </div>
				</>
			
	);
}

export default RPSSettings;