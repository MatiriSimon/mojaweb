import { createCampaign } from "@/app/dashboard/create/actions";

interface CampaignsFormProps {
  error?: string;
}

export default function CampaignsForm({ error }: CampaignsFormProps) {
  return (
    <form action={createCampaign} className="space-y-5 rounded-2xl border bg-slate-400 p-6 shadow-sm">
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

      <div>
        <label className="mb-1 block text-sm font-medium">Campaign title</label>
        <input name="title" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Mary weds John 😋🌹" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Goal amount (KES)</label>
        <input name="goal_amount" type="number" min="1" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="50000" />
      </div>


      <div>
        <label className="mb-1 block text-sm font-medium">End date</label>
        <input
          name="end_date"
          type="date"
          required
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
     </div>


      <div>
        <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
        <input name="cover_image_url" type="url" className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="https://example.com/image.jpg" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Story / description</label>
        <textarea name="description" rows={5} required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Tell donors why this fundraiser matters and how the funds will be used."></textarea>
      </div>

      <button type="submit" className="w-full rounded-xl bg-black px-4 py-2.5 text-sm text-white hover:bg-gray-800">
        Create campaign
      </button>
    </form>
  );
}
