import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import OauthButton from "../../components/common/Oauth42Button";
import authApi from "../../services/api/auth";
import MsgCard from "../../components/common/MsgCard";
import RegularButton from "../../components/common/RegularButton";
import getLocationNotAllowed from "../../services/geoLocation/notAllowed";

const Form: React.FC = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		first_name: "",
		last_name: "",
		email: "",
		password: "",
	});

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number; // Add a key to force re-render
	} | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Get location before submitting
			const location = await getLocationNotAllowed();
			const formDataWithLocation = {
				...formData,
				location,
			};

			const { success, message } = await authApi.register(
				formDataWithLocation
			);
			if (success) {
				setFormData({
					username: "",
					first_name: "",
					last_name: "",
					email: "",
					password: "",
				});
			}
			setMsg({
				type: success ? "success" : "error",
				message,
				key: Date.now(),
			});
		} catch (error) {
			setMsg({
				type: "error",
				message: "Failed to submit form. Please try again.",
				key: Date.now(),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<form
				onSubmit={submitForm}
				className="bg-white shadow-md flex flex-col gap-8 p-10 rounded max-w-3xl items-center"
			>
				<OauthButton action="Register" disabled={isSubmitting} />
				<p>Or create your account and start meeting people</p>
				<FormInput
					name="username"
					onChange={handleChange}
					value={formData.username}
					placeholder="Username*"
					disabled={isSubmitting}
				/>
				<FormInput
					name="first_name"
					onChange={handleChange}
					value={formData.first_name}
					placeholder="First Name*"
					disabled={isSubmitting}
				/>
				<FormInput
					name="last_name"
					onChange={handleChange}
					value={formData.last_name}
					placeholder="Last Name*"
					disabled={isSubmitting}
				/>
				<FormInput
					name="email"
					onChange={handleChange}
					value={formData.email}
					type="email"
					placeholder="E-mail address*"
					disabled={isSubmitting}
				/>
				<FormInput
					name="password"
					onChange={handleChange}
					value={formData.password}
					type="password"
					placeholder="Password*"
					disabled={isSubmitting}
				/>
				<RegularButton value="Create Account" disabled={isSubmitting} />
				<dir className="w-full text-start p-0">
					<p>
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
						>
							Login
						</Link>
					</p>
				</dir>
			</form>
		</>
	);
};

export default Form;
