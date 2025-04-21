import capitalizeLetters from "../../utils/capitalizeLetters";
import ISO6391 from "iso-639-1";

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
			{user.prefered_language != null ? (
				<div className="flex items-center justify-center">
					<div className="flex items-center gap-1 text-font-main">
						<p className="text-sm font-light">
							Preferred language:
						</p>
						<p className="text-sm font-semibold">
							{ISO6391.getName(user.prefered_language)}
						</p>
					</div>
				</div>
			) : null}
			{user.biography ? (
				<div className="prose prose-gray max-w-2xl flex items-center flex-col mx-auto">
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
