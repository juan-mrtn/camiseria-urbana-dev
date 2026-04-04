// // src/components/perfil/NewsletterToggle.tsx// src/components/perfil/NewsletterToggle.tsx
// "use client";

// import { Check, Plus } from "lucide-react";
// import { toggleNewsletterAction } from "@/actions/usuario.actions";
// import { useTransition } from "react";

// interface Props {
//   suscrito: boolean;
// }

// export default function NewsletterToggle({ suscrito }: Props) {
//   const [isPending, startTransition] = useTransition();

//   const handleToggle = () => {
//     // startTransition permite ejecutar la Server Action sin bloquear la UI
//     startTransition(async () => {
//       await toggleNewsletterAction(suscrito);
//     });
//   };

//   return (
//     <button 
//       onClick={handleToggle}
//       disabled={isPending}
//       className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm whitespace-nowrap border disabled:opacity-50 disabled:cursor-not-allowed
//         ${suscrito 
//           ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100' 
//           : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
//         }
//       `}
//     >
//       {suscrito ? (
//         <>
//           <Check className="w-4 h-4 text-green-600" />
//           {isPending ? 'Actualizando...' : 'Suscrito'}
//         </>
//       ) : (
//         <>
//           <Plus className="w-4 h-4" />
//           {isPending ? 'Actualizando...' : 'Suscribirme'}
//         </>
//       )}
//     </button>
//   );
// }