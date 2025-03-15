interface FameProps {
	fame: number;
}

const FameDisplay = ({ fame }: FameProps) => {
	return (
		<div className="relative flex items-center justify-center w-36">
			<div className="absolute text-7xl opacity-30">🔥</div>
			<div className="relative text-center">
				<p className="text-xl font-bold font-mono">{fame}</p>
				<p className="font-bold">Fame</p>
			</div>
		</div>
	);
};

export default FameDisplay;
