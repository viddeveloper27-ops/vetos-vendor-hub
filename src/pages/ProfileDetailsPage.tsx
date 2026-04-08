import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, CreditCard, ShieldCheck, MapPin, Edit3 } from "lucide-react";
import { format } from "date-fns";

const ProfileDetailsPage = () => {
  const { vendor } = useAuth();
  const navigate = useNavigate();
  const initials = vendor?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "V";
  
  // Arched text config
  const text = "JOINED IN MAY 2022"; // Static fallback or dynamically derived from vendor.createdAt
  const joinedDate = vendor?.createdAt ? `JOINED IN ${format(new Date(vendor.createdAt), 'MMMM yyyy').toUpperCase()}` : "JOINED IN MAY 2022";

  return (
    <div className="max-w-xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Avatar Section with Arched Text */}
      <div className="relative flex flex-col items-center pt-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* SVG Arched Text */}
          <svg viewBox="0 0 200 200" className="absolute w-[260px] h-[260px] -top-[31px] pointer-events-none overflow-visible">
            <path
              id="circlePath"
              d="M 20, 100 A 80, 80 0 1, 1 180, 100 A 80, 80 0 1, 1 20, 100"
              fill="none"
              className="stroke-transparent"
            />
            <text className="fill-slate-300 text-[11px] font-black tracking-[0.25em] uppercase">
              <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                {joinedDate} • {joinedDate} • {joinedDate}
              </textPath>
            </text>
          </svg>

          {/* Profile Picture */}
          <div className="relative z-10 p-2 bg-white rounded-full shadow-2xl">
            <Avatar className="h-36 w-36 border-4 border-slate-50">
              <AvatarImage src={vendor?.image} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-rose-400 text-white text-5xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Edit Icon on Avatar */}
            <div 
              onClick={() => navigate("/settings")}
              className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-black text-slate-900 tracking-tight">{vendor?.name}</h1>
      </div>

      {/* Details Sections */}
      <div className="space-y-10 px-4 md:px-0">
        {/* Basic Details */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Basic details</h2>
          
          <div className="space-y-5">
            <DetailItem 
              label="Phone" 
              value={vendor?.phone || "N/A"} 
            />
            <DetailItem 
              label="Email ID" 
              value={vendor?.email || "N/A"} 
              isEditable 
              onEdit={() => navigate("/settings")}
            />
            <DetailItem 
              label="&id" 
              value={vendor?._id?.slice(-8).toUpperCase() || "N/A"} 
            />
            {vendor?.brandName && (
              <DetailItem 
                label="Brand Name" 
                value={vendor.brandName} 
              />
            )}
            {vendor?.legalName && (
              <DetailItem 
                label="Legal Name" 
                value={vendor.legalName} 
              />
            )}
            <DetailItem 
              label="Business Type" 
              value={vendor?.businessType || "Individual"} 
            />
            <DetailItem 
              label="Industry Category" 
              value={vendor?.category || "Other"} 
            />
            <DetailItem 
              label="PAN" 
              value={vendor?.panNumber || "N/A"} 
            />
            {vendor?.gstNumber && (
              <DetailItem 
                label="GST Number" 
                value={vendor.gstNumber} 
              />
            )}
          </div>
        </section>

        {/* Address Section */}
        <section className="space-y-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Address</h2>
          
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current</p>
              <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-md">
                {vendor?.address ? 
                  `${vendor.address.street || ''}, ${vendor.address.city || ''}, ${vendor.address.state || ''}, ${vendor.address.country || 'INDIA'}, ${vendor.address.pincode || ''}` : 
                  "98 91, SHIKHARCHANDI MANE LANE SHIKHARCHANDI NAGAR, BHUBANESWAR, ODISHA, INDIA, 751024"
                }
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Permanent</p>
              <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-md">
                {vendor?.address ? 
                  `${vendor.address.street || ''}, ${vendor.address.city || ''}, ${vendor.address.state || ''}, ${vendor.address.country || 'INDIA'}, ${vendor.address.pincode || ''}` : 
                  "98 91, SHIKHARCHANDI MANE LANE SHIKHARCHANDI NAGAR, BHUBANESWAR, ODISHA, INDIA, 751024"
                }
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isEditable, onEdit }: { label: string, value: string, isEditable?: boolean, onEdit?: () => void }) => (
  <div className="flex justify-between items-start group">
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-base font-bold text-slate-800">{value}</p>
    </div>
    {isEditable && (
      <button 
        onClick={onEdit}
        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
      >
        <Edit3 className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default ProfileDetailsPage;
