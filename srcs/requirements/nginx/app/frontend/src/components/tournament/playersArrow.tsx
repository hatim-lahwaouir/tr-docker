const PlayersArrow = (pros: any) => {
	const divs = [];
	const divs2 = [];
	
	for (let i = 0; i < pros.num; i++) {
		divs.push(
		<div key={`div1-${i}`} className="flex-1 my-2 flex items-center">
			<div
				className="border-y border-r border-black dark:border-white flex-1"
				style={{ height: pros.Height / 2 + 8 }}
			></div>
		</div>
		);

		divs2.push(
		<div key={`div2-${i}`} className="flex-1 my-2 flex items-center">
			<div className="border-t border-black dark:border-white flex-1"></div>
		</div>
		);
	}
	
	return (
		<div className="flex-1 flex min-w-10 max-w-20">
			<div className="flex flex-1 flex-col">
				{divs}
			</div>
			<div className="flex flex-1 flex-col">
			{divs2}
			</div>
		</div>
	);
  };
  
export default PlayersArrow;
  