import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  CalendarClock,
  CalendarRange,
  Camera,
  LayoutDashboard,
  Package,
  Settings,
} from "lucide-vue-next";
import { api, apiError } from "../services/api";
import { bookingStatusLabel, money } from "../utils/formatters";

export function useAdminStore() {
  const token = ref(sessionStorage.getItem("booking_admin_token") || "");
  const tenantName = ref(
    sessionStorage.getItem("booking_tenant_name") || "Studio Senja",
  );
  const account = ref(
    JSON.parse(sessionStorage.getItem("booking_admin_account") || "{}"),
  );
  const tenantSlug = ref(
    sessionStorage.getItem("booking_tenant_slug") || "studio",
  );
  const activeTab = ref("overview");
  const menuOpen = ref(false);
  const showPassword = ref(false);
  const isCompany = computed(() => account.value.role === "company");
  const accountProfessionalName = computed(
    () =>
      professionals.value.find(
        (item) => item.id === account.value.professional_id,
      )?.name || "Fotografer",
  );
  const publicHref = computed(
    () =>
      `/?tenant=${encodeURIComponent(tenantSlug.value)}${!isCompany.value && professionals.value[0]?.slug ? `&pro=${encodeURIComponent(professionals.value[0].slug)}` : ""}`,
  );
  const navItems = computed(() =>
    isCompany.value
      ? [
          {
            key: "overview",
            path: "dashboard",
            label: "Ringkasan",
            icon: LayoutDashboard,
          },
          {
            key: "bookings",
            path: "bookings",
            label: "Reservasi",
            icon: CalendarClock,
          },
          {
            key: "availability",
            path: "availability",
            label: "Jadwal & ketersediaan",
            icon: CalendarRange,
          },
          {
            key: "team",
            path: "photographers",
            label: "Fotografer",
            icon: Camera,
          },
          {
            key: "services",
            path: "services",
            label: "Layanan studio",
            icon: Package,
          },
          {
            key: "settings",
            path: "settings",
            label: "Pengaturan",
            icon: Settings,
          },
        ]
      : [
          {
            key: "overview",
            path: "dashboard",
            label: "Ringkasan saya",
            icon: LayoutDashboard,
          },
          {
            key: "bookings",
            path: "bookings",
            label: "Reservasi saya",
            icon: CalendarClock,
          },
          {
            key: "availability",
            path: "availability",
            label: "Jadwal & ketersediaan",
            icon: CalendarRange,
          },
          {
            key: "team",
            path: "photographers",
            label: "Profil & harga",
            icon: Camera,
          },
          {
            key: "settings",
            path: "settings",
            label: "Pengaturan akun",
            icon: Settings,
          },
        ],
  );
  const currentTitle = computed(
    () =>
      navItems.value.find((item) => item.key === activeTab.value)?.label ||
      "Ringkasan",
  );
  const currentDescription = computed(
    () =>
      ({
        overview: "Pantau aktivitas dan reservasi terbaru.",
        bookings: "Tinjau dan perbarui status setiap reservasi.",
        availability: "Kelola jam kerja dan waktu yang tidak dapat dipesan.",
        team: "Kelola profil dan kehadiran fotografer di situs.",
        services: "Susun katalog paket fotografi studio.",
        settings: "Kelola identitas studio, akses tim, dan keamanan akun.",
      })[activeTab.value],
  );
  const credentials = reactive({ email: "", password: "" });
  const busy = ref(false);
  const loadingWorkspace = ref(false);
  const bookingsLoading = ref(false);
  const error = ref("");
  const message = ref("");
  const messageType = ref("success");
  let notificationTimer;
  const overview = reactive({ counts: {}, recent: [] });
  const bookings = ref([]);
  let bookingRequest = 0;
  const selectedBooking = ref(null);
  const dialogElement = ref(null);
  const pendingStatusChange = ref(null);
  const pendingBlockRemoval = ref(null);
  const blocks = ref([]);
  const professionals = ref([]);
  const services = ref([]);
  const offerings = ref([]);
  const accounts = ref([]);
  const selectedOfferingPro = ref(null);
  const newAccount = reactive({
    email: "",
    password: "",
    professional_id: null,
  });
  const passwordForm = reactive({ current_password: "", new_password: "" });
  const siteForm = reactive({
    name: "",
    tagline: "",
    about: "",
    location: "",
    email: "",
    whatsapp: "",
    hero_image_url: "",
  });
  const newProfessional = reactive({
    name: "",
    slug: "",
    title: "",
    bio: "",
    photo_url: "",
    headline: "",
    approach: "",
  });
  const newService = reactive({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
  });
  const scheduleDrafts = reactive({});
  const weekdays = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const filterStatus = ref("");
  const bookingSearch = ref("");
  let searchTimer;
  const page = ref(1);
  const pagination = reactive({ page: 1, total: 0, totalPages: 0 });
  const blockForm = reactive({
    professional_id: null,
    date: "",
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
  });
  function notify(value, type = "success") {
    message.value = value;
    messageType.value = type;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
      message.value = "";
    }, 6000);
  }
  function logout() {
    sessionStorage.removeItem("booking_admin_token");
    sessionStorage.removeItem("booking_tenant_name");
    sessionStorage.removeItem("booking_admin_account");
    sessionStorage.removeItem("booking_tenant_slug");
    token.value = "";
    account.value = {};
    menuOpen.value = false;
    activeTab.value = "overview";
  }
  async function login() {
    busy.value = true;
    error.value = "";
    try {
      const { data } = await api.post("/admin/login", credentials);
      sessionStorage.setItem("booking_admin_token", data.token);
      sessionStorage.setItem("booking_tenant_name", data.tenant.name);
      sessionStorage.setItem(
        "booking_admin_account",
        JSON.stringify(data.account),
      );
      sessionStorage.setItem("booking_tenant_slug", data.tenant.slug);
      token.value = data.token;
      tenantName.value = data.tenant.name;
      account.value = data.account;
      tenantSlug.value = data.tenant.slug;
    } catch (cause) {
      error.value = apiError(cause);
    } finally {
      busy.value = false;
    }
  }
  async function fetchBookings() {
    const request = ++bookingRequest;
    bookingsLoading.value = true;
    try {
      const { data } = await api.get("/admin/bookings", {
        params: {
          page: page.value,
          ...(filterStatus.value && { status: filterStatus.value }),
          ...(bookingSearch.value && { search: bookingSearch.value }),
        },
      });
      if (request !== bookingRequest) return;
      const lastPage = Math.max(1, data.pagination.totalPages);
      if (page.value > lastPage) {
        page.value = lastPage;
        return;
      }
      bookings.value = data.data;
      Object.assign(pagination, data.pagination);
    } catch (cause) {
      if (request !== bookingRequest) return;
      if (cause.response?.status === 401) logout();
      notify(apiError(cause), "error");
    } finally {
      if (request === bookingRequest) bookingsLoading.value = false;
    }
  }
  async function loadAll() {
    loadingWorkspace.value = true;
    try {
      const [overviewResponse, blocksResponse, prosResponse] =
        await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/blocks"),
          api.get("/admin/professionals"),
        ]);
      Object.assign(overview, overviewResponse.data);
      blocks.value = blocksResponse.data.data;
      professionals.value = prosResponse.data.data;
      if (isCompany.value) {
        const [servicesResponse, siteResponse, accountsResponse] =
          await Promise.all([
            api.get("/admin/services"),
            api.get("/admin/site"),
            api.get("/admin/accounts"),
          ]);
        services.value = servicesResponse.data.data;
        Object.assign(siteForm, siteResponse.data);
        accounts.value = accountsResponse.data.data;
      }
      selectedOfferingPro.value =
        selectedOfferingPro.value ||
        (isCompany.value
          ? professionals.value[0]?.id
          : account.value.professional_id) ||
        null;
      if (selectedOfferingPro.value) await fetchOfferings();
      for (const person of professionals.value)
        scheduleDrafts[person.id] = Object.fromEntries(
          person.schedule.map((item) => [item.weekday, { ...item }]),
        );
      await fetchBookings();
    } catch (cause) {
      if (cause.response?.status === 401) logout();
      notify(apiError(cause), "error");
    } finally {
      loadingWorkspace.value = false;
    }
  }
  async function fetchOfferings() {
    if (!selectedOfferingPro.value) {
      offerings.value = [];
      return;
    }
    try {
      const { data } = await api.get("/admin/offerings", {
        params: { professional_id: selectedOfferingPro.value },
      });
      offerings.value = data.data;
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function saveOfferings() {
    try {
      await api.put(`/admin/offerings/${selectedOfferingPro.value}`, {
        offerings: offerings.value.map(({ service_id, price, active }) => ({
          service_id,
          price,
          active,
        })),
      });
      notify("Paket dan harga disimpan.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function createAccount() {
    try {
      await api.post("/admin/accounts", newAccount);
      Object.assign(newAccount, {
        email: "",
        password: "",
        professional_id: null,
      });
      accounts.value = (await api.get("/admin/accounts")).data.data;
      notify("Akun fotografer dibuat.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function changePassword() {
    try {
      await api.patch("/admin/password", passwordForm);
      Object.assign(passwordForm, { current_password: "", new_password: "" });
      notify("Kata sandi berhasil diperbarui.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  function requestStatusChange(item, status) {
    pendingStatusChange.value = { item, status };
  }
  async function confirmStatusChange() {
    const pending = pendingStatusChange.value;
    pendingStatusChange.value = null;
    if (pending) await updateStatus(pending.item, pending.status);
  }
  async function updateStatus(item, status) {
    try {
      await api.patch(`/admin/bookings/${item.id}/status`, { status });
      notify("Status reservasi diperbarui.");
      await loadAll();
    } catch (cause) {
      notify(apiError(cause), "error");
      await fetchBookings();
    }
  }
  async function addBlock() {
    try {
      await api.post("/admin/blocks", blockForm);
      notify("Jadwal berhasil diblokir.");
      blockForm.reason = "";
      const { data } = await api.get("/admin/blocks");
      blocks.value = data.data;
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function removeBlock(id) {
    try {
      await api.delete(`/admin/blocks/${id}`);
      blocks.value = blocks.value.filter((block) => block.id !== id);
      notify("Blokir jadwal dihapus.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  function requestBlockRemoval(block) {
    pendingBlockRemoval.value = block;
  }
  async function confirmBlockRemoval() {
    const block = pendingBlockRemoval.value;
    pendingBlockRemoval.value = null;
    if (block) await removeBlock(block.id);
  }
  function toggleDay(personId, weekday, enabled) {
    if (enabled)
      scheduleDrafts[personId][weekday] = {
        weekday,
        start_time: "09:00",
        end_time: "17:00",
      };
    else delete scheduleDrafts[personId][weekday];
  }
  async function saveSchedule(personId) {
    try {
      await api.put(`/admin/professionals/${personId}/schedule`, {
        schedule: Object.values(scheduleDrafts[personId]),
      });
      notify("Jam kerja disimpan.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function addProfessional() {
    try {
      const { data } = await api.post("/admin/professionals", newProfessional);
      Object.keys(newProfessional).forEach(
        (key) => (newProfessional[key] = ""),
      );
      notify(
        "Fotografer ditambahkan. Lengkapi jadwal dan harga dari halaman edit.",
      );
      await loadAll();
      return data.id;
    } catch (cause) {
      notify(apiError(cause), "error");
      return null;
    }
  }
  async function saveProfessional(person) {
    try {
      await api.patch(`/admin/professionals/${person.id}`, person);
      notify("Profil fotografer disimpan.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  async function addService() {
    try {
      await api.post("/admin/services", newService);
      Object.assign(newService, {
        name: "",
        description: "",
        duration_minutes: 60,
        price: 0,
      });
      notify("Layanan ditambahkan.");
      await loadAll();
      return true;
    } catch (cause) {
      notify(apiError(cause), "error");
      return false;
    }
  }
  async function saveService(service) {
    try {
      await api.patch(`/admin/services/${service.id}`, service);
      notify("Layanan disimpan.");
      return true;
    } catch (cause) {
      notify(apiError(cause), "error");
      return false;
    }
  }
  async function saveSite() {
    try {
      const { data } = await api.patch("/admin/site", siteForm);
      Object.assign(siteForm, data.data);
      tenantName.value = data.data.name;
      sessionStorage.setItem("booking_tenant_name", data.data.name);
      notify("Profil studio disimpan.");
    } catch (cause) {
      notify(apiError(cause), "error");
    }
  }
  watch(page, fetchBookings);
  watch(selectedOfferingPro, fetchOfferings);
  watch(selectedBooking, async (booking) => {
    if (booking) {
      await nextTick();
      dialogElement.value?.focus();
    }
  });
  watch(
    [menuOpen, selectedBooking, pendingStatusChange, pendingBlockRemoval],
    () => {
      document.body.style.overflow =
        menuOpen.value ||
        selectedBooking.value ||
        pendingStatusChange.value ||
        pendingBlockRemoval.value
          ? "hidden"
          : "";
    },
  );
  watch(
    [token, activeTab, tenantName],
    () => {
      document.title = token.value
        ? `${currentTitle.value} | Panel ${tenantName.value}`
        : `Masuk Admin | ${tenantName.value}`;
    },
    { immediate: true },
  );
  watch(filterStatus, () => {
    if (page.value !== 1) page.value = 1;
    else fetchBookings();
  });
  watch(bookingSearch, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (page.value !== 1) page.value = 1;
      else fetchBookings();
    }, 300);
  });
  onMounted(() => {
    window.addEventListener("keydown", closeMenuOnEscape);
    if (token.value)
      api
        .get("/admin/me")
        .then(({ data }) => {
          account.value = data.account;
          tenantSlug.value = data.tenant.slug;
          tenantName.value = data.tenant.name;
          siteForm.whatsapp = data.tenant.whatsapp || "";
          sessionStorage.setItem(
            "booking_admin_account",
            JSON.stringify(data.account),
          );
          loadAll();
        })
        .catch(() => logout());
  });
  function closeMenuOnEscape(event) {
    if (event.key === "Escape") {
      menuOpen.value = false;
      selectedBooking.value = null;
      pendingStatusChange.value = null;
      pendingBlockRemoval.value = null;
    }
  }
  onBeforeUnmount(() => {
    clearTimeout(searchTimer);
    clearTimeout(notificationTimer);
    document.body.style.overflow = "";
    window.removeEventListener("keydown", closeMenuOnEscape);
  });
  return {
    token,
    tenantName,
    account,
    tenantSlug,
    activeTab,
    menuOpen,
    showPassword,
    isCompany,
    accountProfessionalName,
    publicHref,
    navItems,
    currentTitle,
    currentDescription,
    credentials,
    busy,
    loadingWorkspace,
    bookingsLoading,
    error,
    message,
    messageType,
    overview,
    bookings,
    selectedBooking,
    dialogElement,
    pendingStatusChange,
    pendingBlockRemoval,
    blocks,
    professionals,
    services,
    offerings,
    accounts,
    selectedOfferingPro,
    newAccount,
    passwordForm,
    siteForm,
    newProfessional,
    newService,
    scheduleDrafts,
    weekdays,
    today,
    filterStatus,
    bookingSearch,
    page,
    pagination,
    blockForm,
    notify,
    logout,
    login,
    fetchBookings,
    loadAll,
    fetchOfferings,
    saveOfferings,
    createAccount,
    changePassword,
    requestStatusChange,
    confirmStatusChange,
    updateStatus,
    addBlock,
    removeBlock,
    requestBlockRemoval,
    confirmBlockRemoval,
    toggleDay,
    saveSchedule,
    addProfessional,
    saveProfessional,
    addService,
    saveService,
    saveSite,
    money,
    bookingStatusLabel,
  };
}
