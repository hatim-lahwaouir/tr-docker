import { useHomeContext } from '../../context/HomeContext';
import {useNavigate} from 'react-router-dom';
import { useProfileContext } from '../../context/ProfileContext';
import { port, theHost } from '../../config';


const RankTable = () => {
    const {data} = useHomeContext();
    const navigate = useNavigate();
    const profileInfo = useProfileContext();
    const handleProfileSwitch = (id: string) => {
        profileInfo.setTheId(id);
        navigate(`/profile/${id}`);
      }
	return (
		<div className='  flex-1 flex flex-col justify-center'>                   
            <table className="table-auto m-5 tablet2:m-2 items-center">
                <thead className='text-left'>
                    <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Match</th>
                    <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.slice(0, 10).map((users, key) => (
                            <tr className='h-14' key={key}>
                                <td># {key + 1}</td>
                                <td className='flex gap-2 items-center cursor-pointer' onClick={() => handleProfileSwitch(users.id)}>
                                    <img src={`${theHost}:${port}${users.profile_img}`} alt=""  className=' rounded-full w-9 my-2'/>
                                    <div className='text-lg '>{users.username}</div>
                                </td>
                                <td>{users.games}</td>
                                <td>{(users.level) == '0.00' ? 0 : users.level}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
	)
}

export default RankTable