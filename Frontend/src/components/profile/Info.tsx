import capitalizeLetters from "../../utils/capitalizeLetters";

interface UserData {
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	age: number;
	biography: string;
	fame: number;
	last_online: number;
	gender: string;
	sexual_preference: string;
}

interface InfoProps {
	user: UserData;
}

const Info: React.FC<InfoProps> = ({ user }) => {
	const preferenceDisplay =
		user.sexual_preference === "bisexual"
			? "Male & Female"
			: user.sexual_preference;

	return (
		<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
			<div className="flex flex-col items-center space-y-8">
				{user.gender && user.sexual_preference ? (
					<div className="bg-gray-50 rounded-lg px-6 py-3 shadow-sm">
						<div className="flex items-center gap-3 text-lg">
							<span className="font-medium text-gray-900">
								{capitalizeLetters(user.gender)}
							</span>
							<span className="text-gray-500 text-base">
								looking for
							</span>
							<span className="font-medium text-gray-900">
								{capitalizeLetters(preferenceDisplay)}
							</span>
						</div>
					</div>
				) : null}
			</div>

			{user.biography ? (
				<div className="prose prose-gray max-w-2xl">
					<h2 className="text-font-main text-xl mb-2">Biography</h2>
					<p className="text-gray-700 leading-relaxed text-pretty text-center md:text-start">
						{user.biography}
					</p>
				</div>
			) : null}
		</section>
	);
};

export default Info;
