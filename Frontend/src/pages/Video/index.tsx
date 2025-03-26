import React from "react";
import Description from "./Description";

const index: React.FC = () => {
	const writers = ["Christopher Nolan", "Kai Bird", "Martin Sherwin"];
	const stars = ["Cillian Murphy", "Emily Blunt", "Matt Damon"];

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<div className="">
						<video
							className="w-full rounded-lg bg-black"
							controls
							autoplay
							poster="https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg"
							src="https://imdb-video.media-imdb.com/vi2053751833/1434659607842-pgv4ql-1683541736696.mp4?Expires=1742758560&Signature=B458BZsyS3uwMd4vIFW71N1c9WK0EAGdfsVeYjzgDpdzuIGVtbWorMPPjWWrPLMWY9Xa63YUnaIOQNyfWG5lnBKh4BzQMRvwa2UKYJE0JKtl-pv9sYKBSJc-KEwaeHDnBGTGqaCCu6-YJeh8yZLwO3octGokKX0a8FDhnEcu2BBfSrhiFX~A-gR4myrMfTyywgPrlaChBl-Ighrc4EyCiuulYIyRE9QKhEyFkL8hpiEP7~~2~IBE3WA1febIShio02nct0VoDi0bBUvj2ZDxSfxtE4dMlJh52xO44yXROEJg2kLLsWeDcVBvoRBGyZgwGIFexxe-oaMtJnjou10rQw__&Key-Pair-Id=APKAIFLZBVQZ24NQH3KA"
						></video>
					</div>
					<Description writers={writers} stars={stars} />
				</div>
			</section>
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-4 w-full bg-background-secondary p-4 rounded-lg">
					<h2 className="underline ">Comments</h2>
				</div>
			</section>
		</main>
	);
};

export default index;
