import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  MapPin,
  Edit3,
  Hash,
  Briefcase,
  Fingerprint,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

const ProfileDetailsPage = () => {
  const { vendor } = useAuth();
  const navigate = useNavigate();
  const initials = vendor?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "V";

  // Arched text config
  const text = "JOINED IN MAY 2022"; // Static fallback or dynamically derived from vendor.createdAt
  const joinedDate = vendor?.createdAt ? `JOINED IN ${format(new Date(vendor.createdAt), 'MMMM yyyy').toUpperCase()}` : "JOINED IN MAY 2022";

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-fade-in pb-20 pt-8">
      {/* Refined Avatar Section with Arched Text */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* SVG Arched Text - Refined */}
          <svg viewBox="0 0 200 200" className="absolute w-[280px] h-[280px] pointer-events-none overflow-visible">
            <path
              id="circlePath"
              d="M 20, 100 A 80, 80 0 1, 1 180, 100 A 80, 80 0 1, 1 20, 100"
              fill="none"
              className="stroke-transparent"
            />
            <text className="fill-slate-300 text-[10px] font-semibold tracking-[0.3em] uppercase opacity-70">
              <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                {joinedDate} • {joinedDate} • {joinedDate}
              </textPath>
            </text>
          </svg>

          {/* Profile Picture - Elevated */}
          <div className="relative z-10 p-3 bg-white rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 duration-500">
            <Avatar className="h-40 w-40 border-4 border-slate-50">
              <AvatarImage src={vendor?.image} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-rose-400 text-white text-5xl font-semibold tracking-tighter">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Edit Icon on Avatar */}
            <button
              onClick={() => navigate("/settings")}
              className="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all hover:scale-110 active:scale-90 group/edit"
              title="Edit Profile"
            >
              <Edit3 className="h-4 w-4 text-primary group-hover/edit:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-10 text-center space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{vendor?.name}</h1>
          <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium px-4 py-1 rounded-full border-none">
            Verified Partner
          </Badge>
        </div>
      </div>

      {/* Details Sections */}
      <div className="space-y-14 px-4 md:px-8">
        {/* Basic Details */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Business Profile</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <DetailItem
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={vendor?.phone || "N/A"}
            />
            <DetailItem
              icon={<Mail className="h-4 w-4" />}
              label="Email Address"
              value={vendor?.email || "N/A"}
              isEditable
              onEdit={() => navigate("/settings")}
            />
            <DetailItem
              icon={<Fingerprint className="h-4 w-4" />}
              label="Vendor ID"
              value={vendor?._id?.slice(-8).toUpperCase() || "N/A"}
            />
            {vendor?.brandName && (
              <DetailItem
                icon={<Briefcase className="h-4 w-4" />}
                label="Brand Name"
                value={vendor.brandName}
              />
            )}
            {vendor?.legalName && (
              <DetailItem
                icon={<User className="h-4 w-4" />}
                label="Legal Entity"
                value={vendor.legalName}
              />
            )}
            <DetailItem
              icon={<CreditCard className="h-4 w-4" />}
              label="Business Model"
              value={vendor?.businessType || "Individual"}
            />
            <DetailItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Tax Setting"
              value={vendor?.category || "Registered"}
            />
            <DetailItem
              icon={<Hash className="h-4 w-4" />}
              label="PAN Number"
              value={vendor?.panNumber || "N/A"}
            />
            {vendor?.gstNumber && (
              <DetailItem
                icon={<Hash className="h-4 w-4" />}
                label="GSTIN"
                value={vendor.gstNumber}
              />
            )}
          </div>
        </section>

        {/* Address Section */}
        <section className="">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Registered Office</h2>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="relative group overflow-hidden">

            <div className="bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 relative z-10 flex flex-col sm:flex-row gap-8 items-start transition-all hover:shadow-2xl hover:shadow-slate-200/60 duration-500">

              <div className="space-y-4 flex-1">

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-800 leading-tight tracking-tight uppercase">
                    {vendor?.address?.city || "Bhubaneswar"}, {vendor?.address?.state || "Odisha"}
                  </p>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed uppercase max-w-md">
                    {vendor?.address ?
                      `${vendor.address.street || ''}, ${vendor.address.country || 'INDIA'}, ${vendor.address.pincode || ''}` :
                      "98 91, Shikharchandi Nagar, India, 751024"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
  isEditable,
  onEdit
}: {
  icon?: React.ReactNode,
  label: string,
  value: string,
  isEditable?: boolean,
  onEdit?: () => void
}) => (
  <div className="flex gap-4 group">
    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
      {icon}
    </div>
    <div className="flex-1 space-y-1 pt-1">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        {isEditable && (
          <button
            onClick={onEdit}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
          >
            <Edit3 className="h-3 w-3" />
          </button>
        )}
      </div>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  </div>
);

export default ProfileDetailsPage;
