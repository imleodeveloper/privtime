"use client";
import {
  Calendar,
  CalendarPlus,
  Save,
  SidebarOpen,
  Trash2,
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
import { useRouter } from "next/navigation";

type WeekAvailability = {
  [key: number]: string[];
};

export default function YourSchedule() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogSaveOpen, setIsDialogSaveOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [addTime, setAddTime] = useState({ hour: "", minute: "" });
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  //Fetch dates and times
  const [datesAndTimes, setDatesAndTimes] = useState<WeekAvailability>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  });

  const daysMap: Record<number, string> = {
    1: "Seg",
    2: "Ter",
    3: "Qua",
    4: "Qui",
    5: "Sex",
    6: "Sáb",
    7: "Dom",
  };

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
        router.replace("/signin?redirect=/perfil");
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
        setTimeout(() => router.replace("/signin?redirect=/perfil"), 1000);
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
      setTimeout(() => router.replace("/signin?redirect=/perfil"), 3000);
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

  let m = "";
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (m of ["00", "30"]) {
        const hora = String(h).padStart(2, "0");
        const minute = String(m).padStart(2, "0");
        slots.push(`${hora}:${minute}`);
      }
    }
    return slots;
  };

  const toggleHour = (hour: string) => {
    if (!selectedDay) return;
    setDatesAndTimes((prev) => {
      const dayHours = prev[selectedDay] || [];
      const exists = dayHours.includes(hour);
      return {
        ...prev,
        [selectedDay]: exists
          ? dayHours.filter((h) => h !== hour) /* Remove se já existe */
          : [...dayHours, hour], // Adiciona se não existe
      };
    });
  };

  const handleAddTime = () => {
    if (selectedDay === null) return;

    // Formata a hora para HH:MM
    const formattedHour = `${String(addTime.hour).padStart(2, "0")}:${String(
      addTime.minute
    ).padStart(2, "0")}`;

    setDatesAndTimes((prev) => {
      const dayHours = prev[selectedDay] || [];
      // Evita duplicações
      if (!dayHours.includes(formattedHour)) {
        return {
          ...prev,
          [selectedDay]: [...dayHours, formattedHour].sort(),
        };
      }
      return prev;
    });

    setAddTime({ hour: "", minute: "" });
  };

  useEffect(() => {
    fetchDatesAndTimes();
  }, [userProfile]);

  const fetchDatesAndTimes = async () => {
    try {
      const response = await fetch(
        "/api/auth/perfil/app/dates-and-times/fetch-dates-and-times",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: userProfile.slug_link }),
        }
      );

      const { dates_and_times } = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(
          "Ocorreu um erro ao tentar localizar datas e os horários, tente recarregar a página."
        );
        setShowAlert(!showAlert);
        return;
      }

      setDatesAndTimes(dates_and_times);
    } catch (error) {
      console.error("Erro ao tentar encontrar datas: ", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Ocorreu um erro ao tentar localizar datas e os horários, erro interno do servidor."
      );
      setShowAlert(!showAlert);
      return;
    }
  };

  const updateDatesAndTimes = async (dates_and_times: WeekAvailability) => {
    setIsLoading(true);
    try {
      const body = {
        slug: userProfile.slug_link,
        dates_and_times: dates_and_times,
      };
      const response = await fetch(
        "/api/auth/perfil/app/dates-and-times/update-dates",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(
          "Ocorreu um erro ao tentar atualizar a sua agenda, erro interno do servidor."
        );
        setShowAlert(!showAlert);
        return;
      }

      const data = await response.json();
      alert(data.message);
      setTypeAlert("success");
      setIsAlert(data.message);
      setShowAlert(!showAlert);
      setIsDialogSaveOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.log("Erro interno: ", error);
      setIsLoading(false);
      setTypeAlert("error");
      setIsAlert(
        "Ocorreu um erro ao tentar atualizar a sua agenda, erro interno do servidor."
      );
      setShowAlert(!showAlert);
      return;
    }
  };

  const displayedHours =
    selectedDay !== null
      ? Array.from(
          new Set([
            ...generateTimeSlots(), // horários fixos
            ...datesAndTimes[selectedDay], // horários customizados do dia selecionado
          ])
        )
      : generateTimeSlots(); // se nenhum dia selecionado, só mostra os fixos

  useEffect(() => {
    handleHideAlert();
  }, [showAlert]);

  const handleHideAlert = () => {
    if (showAlert) {
      setTimeout(() => setShowAlert(false), 5000);
    }
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
        <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <Card className="bg-white w-full border-main-pink/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex justify-start items-center gap-2">
                Selecione o dia:
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {Object.keys(daysMap).map((dayKey) => {
                const day = Number(dayKey);
                return (
                  <Button
                    key={day}
                    onClick={() => setSelectedDay(Number(day))}
                    className={`min-w-[80px] bg-white text-gray-700 hover:bg-pink-50 border-gray-300 px-4 ${
                      selectedDay === Number(day)
                        ? "bg-main-purple dark:bg-main-purple text-white hover:border hover:bg-white hover:text-main-purple"
                        : "border"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{daysMap[day]}</div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          {/* Horários Ativos */}
          <Card className="bg-white w-full border-main-pink/40">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between">
              <CardTitle className="flex justify-start items-center gap-2">
                Selecione os horários:
              </CardTitle>
              <div className="pt-4 md:pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Dialog>
                  <DialogTrigger>
                    <Button className="bg-main-purple text-white hover:bg-main-pink flex justify-center items-center gap-2">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Adicionar Horário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicione um novo horário</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault(); // evita o reload da página
                        handleAddTime();
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="changeHour">Horas *</label>
                          <Input
                            id="changeHour"
                            type="number"
                            value={addTime.hour}
                            onChange={(e) =>
                              setAddTime((prev) => ({
                                ...prev,
                                hour: e.target.value,
                              }))
                            }
                            placeholder="Ex: 06"
                            required
                            min={0}
                            max={23}
                          />
                        </div>
                        <div>
                          <label htmlFor="changeMinute">Minutos *</label>
                          <Input
                            id="changeMinute"
                            type="number"
                            value={addTime.minute}
                            onChange={(e) =>
                              setAddTime((prev) => ({
                                ...prev,
                                minute: e.target.value,
                              }))
                            }
                            required
                            placeholder="Ex: 45"
                            min={0}
                            max={60}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <DialogClose>
                          <Button type="button" className="text-white">
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          className="bg-main-purple hover:bg-sub-background text-white hover:text-black"
                          disabled={loading}
                        >
                          {loading ? "Adicionando..." : "Adicionar Horário"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isDialogSaveOpen}
                  onOpenChange={setIsDialogSaveOpen}
                >
                  <DialogTrigger>
                    <Button className="bg-main-purple text-white hover:bg-main-pink flex justify-center items-center gap-2">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Você tem certeza que deseja salvar?
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault(); // evita o reload da página
                        updateDatesAndTimes(datesAndTimes);
                      }}
                      className="space-y-4"
                    >
                      <div className="flex justify-end space-x-2">
                        <DialogClose>
                          <Button type="button" className="text-white">
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          className="bg-main-purple text-white hover:bg-sub-background hover:text-black"
                          disabled={loading}
                        >
                          {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {displayedHours.map((hour) => (
                <button
                  key={hour}
                  className={`px-4 py-2 font-normal border border-main-pink/20 rounded hover:bg-sub-background/50 transition cursor-pointer ${
                    selectedDay !== null &&
                    datesAndTimes[selectedDay]?.includes(hour)
                      ? "bg-main-purple font-semibold text-white border-2 border-main-purple hover:text-black hover:bg-gray-200"
                      : ""
                  }`}
                  onClick={() => toggleHour(hour)}
                >
                  {hour}
                </button>
              ))}
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </>
  );
}
