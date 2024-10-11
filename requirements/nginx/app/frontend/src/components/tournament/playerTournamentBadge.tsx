const PlayerTournamentBadge = (pros:any) =>{

	return(
		<div className={`flex-1 my-2 flex items-center ` + (!pros.alias && 'animate-pulse')} ref={pros.divRef}>
			<div className="h-14 rounded-xl bg-[#bbbbbb] dark:bg-[#323232] flex-1 flex items-center">
				<div className='rounded-full items-center m-2 size-10 flex bg-[#989898]'>
					<img src={pros.Pic ? pros.Pic : ""} alt=""  className=' w-14  rounded-full'/>
				</div>
				<div className='font-bold text-xl mr-2 flex-1 flex w-[80px] truncate'>
					{pros.alias ? pros.alias : <div className="bg-[#989898] flex-1 h-5 rounded-xl min-w-20"></div> }
				</div>
			</div>
		</div>
	);
}

export default PlayerTournamentBadge;    