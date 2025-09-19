"use client";
import {
  Calendar,
  CalendarPlus,
  CheckCheck,
  Clock,
  Globe,
  Instagram,
  LinkIcon,
  LocateIcon,
  LockKeyhole,
  MapPin,
  MapPinned,
  Plus,
  Save,
  SaveIcon,
  SidebarOpen,
  Trash,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Header } from "../../../../components/header";
import { Footer } from "../../../../components/footer";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { supabase } from "../../../../lib/supabase";
import { UserProfile } from "@/app/api/auth/perfil/route";
import { Banner } from "../../../../components/banner-alert";
import { Checkbox } from "../../../../components/ui/checkbox";
import { useRouter } from "next/navigation";

export type TimeRange = {
  start: string;
  end: string;
};

export type WeekAvailability = {
  [key: number]: TimeRange[];
};

export type BusinessProfile = {
  address: string[];
  audience: string[];
  business_name: string;
  cnpj_cpf: string;
  presentation: string;
  updated_at: string;
  links: string[];
  phones: string[];
  dates_and_times: WeekAvailability;
  photo_business: string;
};

export default function MyBusiness() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    user_id: "",
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    created_at: "",
    updated_at: "",
    link_app: "",
    link_share_app: "",
    slug_link: "",
    birthdate: "",
    edit_slug: 0,
  });
  //Fetch dates and times
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    address: [],
    audience: [],
    business_name: "",
    cnpj_cpf: "",
    presentation: "",
    updated_at: "",
    links: [],
    phones: [],
    dates_and_times: [],
    photo_business: "",
  });

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    setIsLoading(true);
    try {
      const { data: sessionUser } = await supabase.auth.getSession();
      const sessionToken = sessionUser.session?.access_token;

      // Se não tiver sessão, já redireciona sem nem chamar a API
      if (!sessionToken) {
        setIsLoading(false);
        router.push("/signin");
        return;
      }

      const response = await fetch("/api/auth/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setShowAlert(true);
        setIsAlert(
          "Não foi possível encontrar usuário. Redirecionando para o login."
        );
        setTimeout(() => router.push("/signin"), 1000);
        return;
      }

      setUserProfile(data.profile);
      setIsLoading(false);
      setTypeAlert("success");
      setShowAlert(true);
      setIsAlert("Usuário encontrado com sucesso. Dados carregados.");
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTimeout(() => router.push("/signin"), 3000);
      return;
    }
  };

  useEffect(() => {
    if (!userProfile.user_id || !userProfile.slug_link) return;

    checkStatusApp();
  }, [userProfile.user_id, userProfile.slug_link]);

  const checkStatusApp = async () => {
    setIsLoading(false);
    if (!userProfile.user_id || !userProfile.slug_link) return;
    try {
      const response = await fetch("/api/auth/perfil/app/status/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.user_id,
          slugUser: userProfile.slug_link,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        window.location.href = "/perfil?status_plan=plan_disabled";
        return;
      }

      setIsLoading(false);
      setTypeAlert("success");
      setIsAlert(data.message);
      setShowAlert(!showAlert);
    } catch (error) {
      console.error("Não foi possível verificar status do plano:", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Não foi possível encontrar plano ativo, erro do servidor. Redirecionando para ínicio do perfil."
      );
      setShowAlert(!showAlert);
      setTimeout(() => (window.location.href = "/perfil"), 5000);
      return;
    }
  };

  useEffect(() => {
    handleMyBusiness();
  }, [userProfile]);

  const handleMyBusiness = async () => {
    if (!userProfile.slug_link || !userProfile.user_id) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/perfil/app/my-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugUser: userProfile.slug_link,
          userId: userProfile.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        return;
      }

      setBusinessProfile(data.userBusiness);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert("Erro interno do servidor.");
      setShowAlert(!showAlert);
      return;
    }
  };

  const handleChangeTime = (
    day: number,
    i: number,
    field: "start" | "end",
    value: string
  ) => {
    setBusinessProfile((prev) => {
      // Cópia profunda do objeto atual
      const updated = { ...prev };

      const updatedDay = [...(updated.dates_and_times[day] || [])];

      // Atualiza o campo
      updatedDay[i] = {
        ...updatedDay[i],
        [field]: value,
      };

      // Coloca de volta no obojeto
      updated.dates_and_times = {
        ...updated.dates_and_times,
        [day]: updatedDay,
      };

      return updated;
    });
  };

  const handleAddTime = (day: number) => {
    setBusinessProfile((prev) => {
      const updated = { ...prev };

      // pega os intervalos existentes do dia, ou array vazio
      const updatedDay = [...(updated.dates_and_times[day] || [])];

      // Adiciona um novo intervalo vázio
      updatedDay.push({ start: "", end: "" });

      updated.dates_and_times = {
        ...updated.dates_and_times,
        [day]: updatedDay,
      };

      return updated;
    });
  };

  const handleRemoveTime = (day: number, index: number) => {
    setBusinessProfile((prev) => {
      const updated = { ...prev };

      // Cópia do dia
      const updatedDay = [...(updated.dates_and_times[day] || [])];

      updatedDay.splice(index, 1);

      updated.dates_and_times = {
        ...updated.dates_and_times,
        [day]: updatedDay,
      };

      return updated;
    });
  };

  const handleAddPhone = () => {
    setBusinessProfile((prev) => ({
      ...prev,
      phones: [...(prev.phones || []), ""],
    }));
  };

  const handleRemovePhone = (index: number) => {
    setBusinessProfile((prev) => ({
      ...prev,
      phones: (prev.phones || []).filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index: number, newValue: string) => {
    setBusinessProfile((prev) => {
      const updatedLinks = [...(prev.links ?? [])];
      updatedLinks[index] = newValue;
      return { ...prev, links: updatedLinks };
    });
  };

  const updateAddress = (index: number, value: string) => {
    setBusinessProfile((prev) => {
      const updatedAddress = [...(prev.address ?? [])];
      updatedAddress[index] = value;
      return { ...prev, address: updatedAddress };
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from("photos_business")
      .upload(
        `photos/${userProfile.slug_link}/${Date.now()}-${file.name}`,
        file
      );

    if (error) {
      console.error("Erro no upload:", error);
      setTypeAlert("error");
      setIsAlert("Erro ao enviar imagem.");
      setShowAlert(!showAlert);
      return;
    }

    const publicUrl = supabase.storage
      .from("photos_business")
      .getPublicUrl(data.path).data.publicUrl;

    setBusinessProfile((prev) => ({
      ...prev,
      photo_business: publicUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/perfil/app/my-business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessProfile, userId: userProfile.user_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        setIsLoading(false);
        return;
      }

      setTypeAlert("success");
      setIsAlert(data.message);
      setShowAlert(!showAlert);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro interno do servidor:", error);
      setTypeAlert("error");
      setIsAlert(
        `Não foi possível confirmar dados de " Meu Negócio ", erro interno do servidor`
      );
      setShowAlert(!showAlert);
      setIsLoading(false);
      return;
    }
  };

  useEffect(() => {
    handleHideAlert();
  }, [showAlert]);

  const handleHideAlert = () => {
    if (showAlert) {
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const formatHour = (value: string) => {
    let digits = value.replace(/\D/g, ""); // remove tudo que não for número
    if (digits.length > 4) digits = digits.slice(0, 4);

    const hours = digits.slice(0, 2);
    const minutes = digits.slice(2, 4);

    let formatted = "";
    if (digits.length >= 3) {
      formatted = `${hours}:${minutes}`;
      // return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    } else if (digits.length >= 1) {
      formatted = hours;
      // return digits;
    }

    // Validação
    if (hours && parseInt(hours) > 23) {
      return "23" + (minutes ? `:${minutes}` : "");
    }
    if (minutes && parseInt(minutes) > 59) {
      return `${hours}:59`;
    }

    return formatted;
  };

  const formatName = (value: string) => {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatTel = (value: string) => {
    // Remove tudo que não for número
    let digits = value.replace(/\D/g, "");

    // Limita para 11 digitos (ddd + 9 digit)
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    // Monta no formato XX XXXXX-XXXX
    if (digits.length > 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      return `(${digits})`;
    }

    return "";
  };

  const daysName: Record<number, string> = {
    0: "Segunda-feira",
    1: "Terça-feira",
    2: "Quarta-feira",
    3: "Quinta-feira",
    4: "Sexta-feira",
    5: "Sábado",
    6: "Domingo",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-pink mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Banner
        type={typeAlert}
        show={showAlert}
        hide={() => setShowAlert(false)}
        message={isAlert}
      />
      <Header />
      <main className="w-full min-h-screen flex justify-center items-start pb-20">
        <NavigationProfile open={openMenu} onClose={() => setOpenMenu(false)} />
        <article className="relative w-full lg:w-[80%] h-auto flex justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col lg:flex-row justify-start items-center lg:justify-center lg:items-start gap-8"
          >
            <Card className="bg-white w-full border-main-pink/40">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex justify-start items-center gap-2">
                  Informações - Meu Negócio
                </CardTitle>
                <Button
                  className="text-white flex justify-center items-center gap-1"
                  type="submit"
                >
                  <SaveIcon className="w-4 h-4"></SaveIcon> Salvar
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <h1 className="text-base text-main-pink/80 font-semibold">
                  Essas informações irão ficar vísiveis para seus clientes no
                  seu APP (exceto CNPJ/CPF).
                </h1>
                <div className="flex flex-col justify-center items-center w-full bg-gray-200 rounded-sm p-2 gap-4">
                  <label
                    htmlFor="upload-photo"
                    className="w-full flex flex-col justify-center items-start gap-1 cursor-pointer"
                  >
                    <span>Upload de foto</span>
                    <div className="w-full group bg-white px-2 py-1 flex justify-start items-center gap-2 rounded-lg hover:border-purple-500 hover:ring-1 hover:ring-purple-500">
                      {businessProfile.photo_business ? (
                        <CheckCheck
                          className={`w-5.5 h-5.5 ${
                            businessProfile.photo_business
                              ? "text-green-600 group-hover:text-green-800"
                              : ""
                          }`}
                        ></CheckCheck>
                      ) : (
                        <>
                          <Upload className="w-5.5 h-5.5 group-hover:text-purple-500"></Upload>
                        </>
                      )}
                      <span
                        className={`text-base ${
                          businessProfile.photo_business
                            ? "text-green-600 group-hover:text-green-800"
                            : "group-hover:text-purple-500"
                        }`}
                      >
                        {businessProfile.photo_business
                          ? "Foto Anexada "
                          : "Selecionar uma foto "}
                        <span className="text-sm text-gray-800 font-bold">
                          Máx: 5MB
                        </span>
                      </span>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      id="upload-photo"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <Input
                    type="text"
                    placeholder="Nome do negócio - empresa ou pessoal"
                    className="py-2"
                    value={businessProfile.business_name || ""}
                    onChange={(e) =>
                      setBusinessProfile((prev) => ({
                        ...prev,
                        business_name: formatName(e.target.value),
                      }))
                    }
                  />
                  <Input
                    type="text"
                    placeholder="CNPJ/CPF"
                    className="py-2"
                    value={businessProfile.cnpj_cpf || ""}
                    onChange={(e) =>
                      setBusinessProfile((prev) => ({
                        ...prev,
                        cnpj_cpf: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    maxLength={14}
                  />
                  <textarea
                    placeholder="Carta de apresentação"
                    className="w-full bg-white px-2 py-2 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    value={businessProfile.presentation || ""}
                    onChange={(e) =>
                      setBusinessProfile((prev) => ({
                        ...prev,
                        presentation: e.target.value,
                      }))
                    }
                    maxLength={500}
                  ></textarea>
                  {((businessProfile.phones ?? []).length > 0
                    ? businessProfile.phones
                    : [""]
                  ).map((phone, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-col justify-center items-start w-full gap-2 px-1 py-2 rounded-sm bg-sub-background/60"
                      >
                        <label className="text-sm">Telefone {index + 1}</label>
                        <Input
                          type="text"
                          placeholder="(00) 00000-0000"
                          className="py-2"
                          maxLength={15}
                          value={phone || ""}
                          onChange={(e) =>
                            setBusinessProfile((prev) => {
                              const updatedPhone = [...(prev.phones ?? [])];
                              updatedPhone[index] = formatTel(e.target.value);

                              return { ...prev, phones: updatedPhone };
                            })
                          }
                        />
                        <div className="w-full flex justify-end items-center gap-2">
                          <Plus
                            onClick={handleAddPhone}
                            className="bg-main-purple text-white w-8 h-8 rounded-sm cursor-pointer hover:bg-main-purple/60"
                          ></Plus>
                          {(businessProfile.phones ?? []).length > 1 && (
                            <Trash
                              onClick={() => handleRemovePhone(index)}
                              className="w-8 h-8 bg-red-600 rounded-sm text-white cursor-pointer hover:bg-red-400 p-1"
                            ></Trash>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="w-full flex justify-center items-start flex-col gap-3">
                    <h2 className="text-base text-main-pink/80 font-semibold flex justify-start items-start gap-2">
                      <User className="w-5 h-5 text-main-pink"></User>
                      Público-alvo
                    </h2>
                    <div className="flex justify-start items-center gap-12">
                      <div className="flex justify-center items-center gap-2">
                        <Checkbox
                          id="men"
                          checked={(businessProfile.audience || []).includes(
                            "Homem"
                          )}
                          onCheckedChange={(checked) =>
                            setBusinessProfile((prev) => {
                              const currentAudience = prev.audience || [];
                              let updatedAudience = checked
                                ? [...currentAudience, "Homem"] // adiciona
                                : currentAudience.filter(
                                    (item) => item !== "Homem" // remove
                                  );

                              // Forçar ordem fixa

                              const order = ["Homem", "Mulher", "Trans"];
                              updatedAudience = order.filter((item) =>
                                updatedAudience.includes(item)
                              );

                              return { ...prev, audience: updatedAudience };
                            })
                          }
                        ></Checkbox>
                        <label htmlFor="men">Homem</label>
                      </div>
                      <div className="flex justify-center items-center gap-2">
                        <Checkbox
                          checked={(businessProfile.audience || []).includes(
                            "Mulher"
                          )}
                          id="women"
                          onCheckedChange={(checked) =>
                            setBusinessProfile((prev) => {
                              const currentAudience = prev.audience || [];
                              let updatedAudience = checked
                                ? [...currentAudience, "Mulher"] // adiciona
                                : currentAudience.filter(
                                    (item) => item !== "Mulher" // remove
                                  );

                              // Forçar ordem fixa

                              const order = ["Homem", "Mulher", "Trans"];
                              updatedAudience = order.filter((item) =>
                                updatedAudience.includes(item)
                              );

                              return { ...prev, audience: updatedAudience };
                            })
                          }
                        ></Checkbox>
                        <label htmlFor="women">Mulher</label>
                      </div>
                      <div className="flex justify-center items-center gap-2">
                        <Checkbox
                          id="trans"
                          checked={(businessProfile.audience || []).includes(
                            "Trans"
                          )}
                          onCheckedChange={(checked) =>
                            setBusinessProfile((prev) => {
                              const currentAudience = prev.audience || [];
                              let updatedAudience = checked
                                ? [...currentAudience, "Trans"] // adiciona
                                : currentAudience.filter(
                                    (item) => item !== "Trans" // remove
                                  );

                              // Forçar ordem fixa

                              const order = ["Homem", "Mulher", "Trans"];
                              updatedAudience = order.filter((item) =>
                                updatedAudience.includes(item)
                              );

                              return { ...prev, audience: updatedAudience };
                            })
                          }
                        ></Checkbox>
                        <label htmlFor="trans">Trans</label>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-start flex-col gap-3 mt-6">
                    <h2 className="text-base text-main-pink/80 font-semibold flex justify-start items-start gap-2">
                      <LinkIcon className="w-5 h-5 text-main-pink"></LinkIcon>
                      Links e Redes Sociais
                    </h2>
                    <div className="w-full relative flex flex-col justify-start items-start">
                      <label htmlFor="link_site" className="text-gray-600 pl-1">
                        Site
                      </label>
                      <Input
                        id="link_site"
                        type="text"
                        className="pl-10 py-2"
                        value={businessProfile.links?.[0] || ""}
                        onChange={(e) => updateLink(0, e.target.value)}
                        placeholder="https://"
                      />
                      <Globe className="w-5 h-5 text-gray-500 absolute top-8.5 left-2"></Globe>
                    </div>
                    <div className="w-full relative flex flex-col justify-start items-start">
                      <label htmlFor="link-1" className="text-gray-600 pl-1">
                        Instagram
                      </label>
                      <Input
                        id="link-1"
                        type="text"
                        className="pl-10 py-2"
                        value={businessProfile.links?.[1] || ""}
                        onChange={(e) => updateLink(1, e.target.value)}
                        placeholder="@meuinstagram"
                      />
                      <Instagram className="w-5 h-5 text-gray-500 absolute top-8.5 left-2"></Instagram>
                    </div>
                    <div className="w-full relative flex flex-col justify-start items-start">
                      <label htmlFor="link-2" className="text-gray-600 pl-1">
                        OnlyFans
                      </label>
                      <Input
                        id="link-2"
                        type="text"
                        className="pl-10 py-2"
                        placeholder="https://"
                        value={businessProfile.links?.[2] || ""}
                        onChange={(e) => updateLink(2, e.target.value)}
                      />
                      <LockKeyhole className="w-5 h-5 text-gray-500 absolute top-8.5 left-2"></LockKeyhole>
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-start flex-col gap-3 mt-6">
                    <h2 className="text-base text-main-pink/80 font-semibold flex justify-start items-start gap-2">
                      <MapPin className="w-5 h-5 text-main-pink"></MapPin>
                      Localização
                    </h2>
                    <div className="w-full relative flex flex-col justify-start items-start">
                      <label htmlFor="link-3" className="text-gray-600 pl-1">
                        CEP
                      </label>
                      <Input
                        id="link-3"
                        type="text"
                        className="pl-10 py-2"
                        placeholder="01310000"
                        maxLength={8}
                        value={businessProfile.address?.[0] || ""}
                        onChange={(e) =>
                          updateAddress(0, e.target.value.replace(/\D/g, ""))
                        }
                      />
                      <MapPinned className="w-5 h-5 text-gray-500 absolute top-8.5 left-2"></MapPinned>
                    </div>
                    <div className="w-full relative flex flex-col justify-start items-start">
                      <label htmlFor="link-3" className="text-gray-600 pl-1">
                        Número do Endereço
                      </label>
                      <Input
                        id="link-3"
                        type="text"
                        className="pl-10 py-2"
                        placeholder="1750 Casa 2"
                        maxLength={20}
                        value={businessProfile.address?.[1] || ""}
                        onChange={(e) => updateAddress(1, e.target.value)}
                      />
                      <MapPinned className="w-5 h-5 text-gray-500 absolute top-8.5 left-2"></MapPinned>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Horários Ativos */}
            <Card className="bg-white w-full border-main-pink/40">
              <CardHeader className="flex flex-col md:flex-row items-center justify-between">
                <CardTitle className="flex justify-start items-center gap-2">
                  <h2 className="text-base text-main-pink/80 font-semibold flex justify-start items-start gap-2">
                    <Clock className="w-5 h-5"></Clock> Horários de Atendimento
                  </h2>
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-2">
                {Object.entries(businessProfile.dates_and_times).map(
                  ([dayIndex, intervals]) => {
                    const day = Number(dayIndex);
                    return (
                      <div
                        key={day}
                        className="flex flex-col justify-center items-start w-full"
                      >
                        <span>{daysName[day]}</span>
                        <div className="flex justify-start items-center flex-wrap gap-4 w-full py-3">
                          {intervals.map((interval, index) => (
                            <div
                              key={index}
                              className="flex justify-start items-center w-auto gap-2"
                            >
                              <div className="w-auto relative">
                                <Input
                                  type="text"
                                  className="max-w-16 text-sm border border-main-purple focus:border-none "
                                  placeholder="06:00"
                                  value={interval.start}
                                  onChange={(e) =>
                                    handleChangeTime(
                                      day,
                                      index,
                                      "start",
                                      formatHour(e.target.value)
                                    )
                                  }
                                />
                                <span className="absolute -top-3 left-2 text-main-purple text-sm bg-white px-1">
                                  De
                                </span>
                              </div>
                              <div className="w-auto relative">
                                <Input
                                  type="text"
                                  className="max-w-16 text-sm border border-main-purple focus:border-none "
                                  placeholder="14:00"
                                  value={interval.end}
                                  onChange={(e) =>
                                    handleChangeTime(
                                      day,
                                      index,
                                      "end",
                                      formatHour(e.target.value)
                                    )
                                  }
                                />
                                <span className="absolute -top-3 left-2 text-main-purple text-sm bg-white px-1">
                                  Até
                                </span>
                              </div>
                              <div className="flex justify-center items-center gap-3">
                                <Trash
                                  className="w-6 h-6 p-1 cursor-pointer text-black bg-gray-400 hover:bg-gray-600 hover:text-white rounded-md"
                                  onClick={() => handleRemoveTime(day, index)}
                                ></Trash>
                                <Plus
                                  onClick={() => handleAddTime(day)}
                                  className="w-6 h-6 p-1 bg-main-purple hover:bg-main-purple/60 cursor-pointer text-white rounded-md"
                                ></Plus>
                              </div>
                            </div>
                          ))}
                          {intervals.length === 0 && (
                            <div className="flex justify-start items-center w-auto gap-2">
                              <Button
                                className="text-white flex justify-center items-center gap-2"
                                onClick={() => handleAddTime(day)}
                              >
                                <Plus className="w-5 h-5"></Plus>
                                Adicionar horário
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
                <Button
                  className="text-white flex justify-center items-center gap-1"
                  type="submit"
                >
                  <SaveIcon className="w-4 h-4"></SaveIcon> Salvar
                </Button>
              </CardContent>
            </Card>
          </form>
        </article>
      </main>
      <Footer />
    </>
  );
}
