import Image from "next/image";
import Link from "next/link";
import ProgressBar from "@/components/proggress-bar";

type Campaign = {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  cover_image_url?: string | null;
  end_date?: string | null; // -- new field
};

export default function CampaignsCard({ campaign }: { campaign: Campaign }) {
  const raised = Number(campaign.current_amount ?? 0);
  const goal = Number(campaign.goal_amount ?? 1);
  const campaignPath = `/campaigns/${encodeURIComponent(campaign.id)}`;

  // Format end date nicely
  const formattedEndDate = campaign.end_date
    ? new Date(campaign.end_date).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="group rounded-3xl border border-gray-200 bg-slate-stripes p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {campaign.cover_image_url ? (
        <Image
          src={campaign.cover_image_url}
          alt={campaign.title}
          width={600}
          height={240}
          unoptimized
          className="mb-4 h-36 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="mb-4 flex h-36 w-full items-center justify-center rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 text-sm text-gray-500">
          No image yet
        </div>
      )}

      <h3 className="mt-2 text-xl font-semibold text-gray-900">{campaign.title}</h3>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{campaign.description}</p>

      <div className="mt-4 rounded-2xl bg-gray-50 p-3">
        <ProgressBar current={raised} goal={goal} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600">
        <span className="font-medium text-gray-900">KES {raised.toLocaleString()} raised</span>
        <span>Goal KES {goal.toLocaleString()}</span>
      </div>

      {formattedEndDate && (
        <div className="mt-2 text-sm text-gray-500">
          Ends on <span className="font-medium">{formattedEndDate}</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={campaignPath}
          className="inline-flex items-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          View campaign
        </Link>
        <Link
          href={`${campaignPath}/donate`}
          className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        >
          Donate now
        </Link>
      </div>
    </article>
  );
}
