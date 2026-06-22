import Image from "next/image";
import Link from "next/link";
import ProgressBar from "@/components/proggress-bar";

type Campaign = {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  goal_amount: number;
  current_amount: number;
  image_url?: string | null;
};

export default function CampaignsCard({ campaign }: { campaign: Campaign }) {
  const raised = Number(campaign.current_amount ?? 0);
  const goal = Number(campaign.goal_amount ?? 1);

  return (
    <article className="group rounded-3xl border border-gray-200 bg-slate-stripes p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      {campaign.image_url ? (
        <Image
          src={campaign.image_url}
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

      <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">{campaign.category ?? "General"}</p>
      <h3 className="mt-2 text-xl font-semibold text-gray-900">{campaign.title}</h3>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{campaign.description}</p>

      <div className="mt-4 rounded-2xl bg-gray-50 p-3">
        <ProgressBar current={raised} goal={goal} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600">
        <span className="font-medium text-gray-900">KES {raised.toLocaleString()} raised</span>
        <span>Goal KES {goal.toLocaleString()}</span>
      </div>

      <Link
        href={`/campaigns/${campaign.id}`}
        className="mt-5 inline-flex items-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        View campaign
      </Link>
    </article>
  );
}
