import { useState } from "react";
import Modal from "../../components/common/Modal";

interface User {
	first_name: string;
	images: string[];
}

interface ImageGalleryProps {
	user: User;
	privateProfile?: boolean;
}

const ImageGallery = ({ user, privateProfile = false }: ImageGalleryProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
						<span className="fa fa-image" />
						{privateProfile
							? "Your Images"
							: user.username + "'s Images"}
					</h3>
					<button
						onClick={() => setIsModalOpen(false)}
						className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<span className="fa fa-close" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4 md:p-6">
					{user.images && user.images.length > 0 ? (
						<div className="flex flex-wrap gap-2 md:gap-4 justify-center">
							{user.images.map((image, index) => (
								<div
									key={index}
									className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] flex-grow-0 flex-shrink-0"
								>
									<div className="relative pt-[100%]">
										<img
											src={image.imageURL}
											alt={`${user.first_name}'s image ${
												index + 1
											}`}
											className="absolute inset-0 w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<span className="fa fa-image" />
							<p>No images uploaded yet</p>
						</div>
					)}
				</div>
			</Modal>

			{/* Trigger Button */}
			<button
				onClick={() => setIsModalOpen(true)}
				className="group inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5 font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-200"
			>
				<span className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
					<span className="fa fa-image" />
					{privateProfile
						? "Your Images"
						: user.username + "'s Images"}
				</span>
			</button>
		</div>
	);
};

export default ImageGallery;
