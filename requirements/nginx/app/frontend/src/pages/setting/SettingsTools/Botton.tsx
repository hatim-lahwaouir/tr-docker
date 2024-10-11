interface ButtonBarProps {
	names: string;
	handleClick: () => void;
	Checked: string
}

const ButtonBar=({names, handleClick, Checked}:ButtonBarProps)=>{
	return<button onClick={handleClick} className={`h-12 flex items-center  
	justify-center font-bold text-10   hover:bg-[rgba(255,255,255,0.30)] active:bg-[rgba(255,255,255,0.5)]
	 rounded-lg focus:bg-[rgba(255,255,255,0.10)] ${Checked === names ? 'bg-[rgba(255,255,255,0.20)]' :''}`}>
		{names}
		</button>
}

export default ButtonBar;