import MsgCard from "../../components/common/MsgCard";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import OauthButton from "../../components/common/Oauth42Button";
import { useAuth } from "../../context/AuthContext";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";
import Modal from "../../components/common/Modal";

interface User {
	id: string;
	first_name: string;
	images: string[];
}

interface ImageGalleryProps {
	user: User;
	onImagesUpdate?: (images: string[]) => void;
}

const ImageGallery = ({ user, onImagesUpdate }: ImageGalleryProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const { uploadImages, removeImage } = useEditProfile();
	const { user: authUser } = useAuth();

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!e.target.files || !authUser?.id) return;

		setIsUploading(true);
		try {
			const files = Array.from(e.target.files);
			const response = await uploadImages(authUser.id, files);
			if (response && response.msg) {
				let newImages = response.images;
				// combine new images with existing images
				if (user.images.length < 4)
					newImages = [...user.images, ...response.msg];
				onImagesUpdate(newImages);
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message ||
					"Failed to upload images, please try again",
				key: Date.now(),
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = async (imageId: string) => {
		if (!authUser?.id) return;

		try {
			const response = await removeImage(authUser.id, imageId);
			// delete image from state using id
			const newImages = user.images.filter(
				(image) => image.imageId !== imageId
			);
			onImagesUpdate && onImagesUpdate(newImages);
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message || "Failed to remove image, please try again",
				key: Date.now(),
			});
		}
	};

	return (
		<section className="container max-w-4xl mx-auto flex justify-center">
			{/* Modal */}
			{isModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				>
					{/* Error card if image upload fails */}
					{msg && (
						<MsgCard
							key={msg.key}
							type={msg.type}
							message={msg.message}
							onClose={() => setMsg(null)}
						/>
					)}
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b">
						<h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
							<span className="fa fa-image" />
							Edit Your Images{" "}
							<span className="font-light text-base text-gray-500">
								(4 pictures max)
							</span>
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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{user.images.map((image, index) => (
								<div key={index} className="relative group">
									<img
										src={image.imageURL}
										alt={`Profile ${index + 1}`}
										className="w-full h-48 object-cover rounded-lg"
									/>
									<button
										type="button"
										onClick={() =>
											handleRemoveImage(image.imageId)
										}
										className="absolute top-2 right-2 bg-red-500 text-white h-7 w-7 rounded-full xl:opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<i className="fa fa-trash" />
									</button>
								</div>
							))}
							{/* Add new image input */}
							{user.images.length < 4 && (
								<div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
									<label className="cursor-pointer text-center">
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
											multiple
											disabled={isUploading}
										/>
										<i className="fa fa-plus text-3xl text-gray-400 mb-2" />
										<p className="text-sm text-gray-500">
											{isUploading
												? "Uploading..."
												: "Add Image"}
										</p>
									</label>
								</div>
							)}
						</div>
						{isUploading && (
							<p className="text-blue-500 text-sm mt-2">
								Uploading image...
							</p>
						)}
					</div>
				</Modal>
			)}

			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsModalOpen(true)}
				className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 p-0.5 font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-cyan-200"
			>
				<span className="flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0">
					<span className="fa fa-image" />
					Update pictures
				</span>
			</button>
		</section>
	);
};

export default ImageGallery;
