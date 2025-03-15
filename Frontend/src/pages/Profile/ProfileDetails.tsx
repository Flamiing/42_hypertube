import FameRating from "../../components/common/FameRating";

const ProfileDetails: React.FC = ({ user }) => {
	return (
		<section className="container max-w-4xl text-center px-3 flex justify-center">
			<div className="flex flex-row justify-center w-fit">
				<FameRating fame={user.fame} />
			</div>
		</section>
	);
};

export default ProfileDetails;
