import * as React from "react";
import { CustomerStatus } from "../StatusBadge";
import { CustomerProfileHeader } from "./CustomerProfileHeader";
import { CustomerInfoStrip } from "./CustomerInfoStrip";
import { OverviewTab } from "./OverviewTab";
import { ProfileTab } from "./ProfileTab";
import { HouseholdTab } from "./HouseholdTab";
import { MembershipTab } from "./MembershipTab";
import { BillingHistoryTab } from "./BillingHistoryTab";
import { InteractionsTab } from "./InteractionsTab";
import { FilesTab } from "./FilesTab";
import { ChangeHistoryTab } from "./ChangeHistoryTab";
import { EditCustomerProfileDialog } from "./EditCustomerProfileDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { useApiClient } from "../../../hooks/useApiClient";

const STATUS_TO_BADGE: Record<string, CustomerStatus> = {
  LEAD: "lead",
  TRIAL: "trial",
  ACTIVE: "active",
  FROZEN: "frozen",
  CANCELLED: "cancelled",
  FORMER: "former",
};

const INTERACTION_TYPE_MAP: Record<string, "note" | "phone" | "email" | "sms" | "automation"> = {
  NOTE: "note",
  CALL: "phone",
  EMAIL: "email",
  SMS: "sms",
  IN_PERSON: "note",
  AUTOMATION_EVENT: "automation",
};

const FILE_CATEGORY_MAP: Record<string, "document" | "image" | "contract" | "invoice" | "other"> = {
  WAIVER: "document",
  CONTRACT: "contract",
  ID: "document",
  OTHER: "other",
};

const mapMembershipStatus = (
  status?: string | null,
): "active" | "frozen" | "cancelled" | "trial" => {
  switch (status) {
    case "FROZEN":
      return "frozen";
    case "TRIAL":
      return "trial";
    case "ACTIVE":
      return "active";
    default:
      return "cancelled";
  }
};

const formatEnumLabel = (value?: string | null) => {
  if (!value) return "—";
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

interface ApiCustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  status: string;
  primaryLocation: { id: string; name: string } | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  canEmail: boolean;
  canSms: boolean;
  tags: string[];
  createdAt: string;
  dateOfBirth?: string | null;
  memberships: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate?: string | null;
    renewalDate?: string | null;
    membershipPlan: { id: string; name: string } | null;
  }>;
}

interface ApiHousehold {
  id: string;
  headCustomerProfileId: string;
  headCustomerProfile?: ApiCustomerProfile | null;
  members: Array<{
    id: string;
    relationship?: string | null;
    customerProfile: ApiCustomerProfile;
  }>;
}

interface ApiMembership {
  id: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  renewalDate?: string | null;
  membershipPlanId?: string | null;
  membershipPlan: {
    id: string;
    name: string;
    cadence: string;
    priceCents: number;
    currency: string;
    termType: string;
    scopeType: "ORG_WIDE" | "SPECIFIC_LOCATIONS";
    hasIntroPeriod: boolean;
    introMonths?: number | null;
    introPriceCents?: number | null;
    locations?: Array<{
      locationId: string;
      location?: { id: string; name: string } | null;
    }>;
  } | null;
}

interface ApiBillingEvent {
  id: string;
  date: string;
  description?: string | null;
  amountCents: number;
  currency: string;
  status: string;
  externalInvoiceId?: string | null;
}

interface ApiCustomerFile {
  id: string;
  fileName: string;
  category: string;
  sizeBytes: number;
  uploadedByUserId: string;
  uploadedAt: string;
}

interface ApiInteraction {
  id: string;
  interactionType: string;
  title: string;
  body?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name?: string | null;
  } | null;
}

interface CustomerSummaryResponse {
  customer: ApiCustomerProfile;
  household: ApiHousehold | null;
  membership: ApiMembership | null;
  billingEvents: ApiBillingEvent[];
  files: ApiCustomerFile[];
  interactions: ApiInteraction[];
}

interface CustomerProfilePageProps {
  customerId?: string;
  onBack?: () => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (amountCents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
};

export function CustomerProfilePage({
  customerId,
  onBack,
  onNavigateToCustomer,
}: CustomerProfilePageProps) {
  const apiClient = useApiClient();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [summary, setSummary] = React.useState<CustomerSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const fetchSummary = React.useCallback(async () => {
    if (!customerId) {
      setSummary(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<CustomerSummaryResponse>(
        `/api/customers/${customerId}/summary`
      );
      setSummary(response);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, customerId]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-lg font-medium">Select a customer to view details</p>
        <p className="text-muted-foreground text-sm">
          Choose a record from the customers list to load their profile.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border py-16 text-muted-foreground">
        Loading customer profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <p className="font-medium text-destructive">Unable to load customer</p>
        <p className="text-sm text-destructive/80">{error}</p>
        <Button variant="outline" onClick={fetchSummary}>
          Retry
        </Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
        Customer not found.
      </div>
    );
  }

  const customer = summary.customer;
  const membership = summary.membership;
  const badgeStatus =
    STATUS_TO_BADGE[customer.status] ?? STATUS_TO_BADGE.LEAD;
  const primaryLocation = customer.primaryLocation?.name ?? "Unassigned";

  const membershipPlanName =
    membership?.membershipPlan?.name ??
    customer.memberships[0]?.membershipPlan?.name ??
    null;
  const membershipStatusLabel = membership
    ? formatEnumLabel(membership.status)
    : "No membership";

  const membershipPlanDetails = membership?.membershipPlan;
  type MembershipScope = "organization" | "specific-locations";
  const membershipScope: MembershipScope =
    membershipPlanDetails?.scopeType === "SPECIFIC_LOCATIONS"
      ? "specific-locations"
      : "organization";
  const membershipLocations =
    membershipPlanDetails?.locations?.map(
      (location) => location.location?.name ?? location.locationId
    ) ?? [];
  const membershipCadence = membershipPlanDetails?.cadence
    ? formatEnumLabel(membershipPlanDetails.cadence)
    : "Custom";
  const membershipPrice = membershipPlanDetails
    ? formatCurrency(membershipPlanDetails.priceCents, membershipPlanDetails.currency ?? "USD")
    : "—";
  const membershipTermType = membershipPlanDetails?.termType
    ? formatEnumLabel(membershipPlanDetails.termType)
    : "Standard";
  const membershipIntroPeriod =
    membershipPlanDetails?.hasIntroPeriod && membershipPlanDetails.introMonths
      ? `${membershipPlanDetails.introMonths} months at ${formatCurrency(
          membershipPlanDetails.introPriceCents ?? 0,
          membershipPlanDetails.currency ?? "USD"
        )}`
      : undefined;

  const overviewData = {
    email: customer.primaryEmail ?? "—",
    phone: customer.primaryPhone ?? "—",
    address: {
      street: customer.addressLine1 ?? "—",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zip: customer.postalCode ?? "",
    },
    tags: customer.tags ?? [],
    membershipPlan: membershipPlanName,
    membershipStatus: membershipStatusLabel,
    joinDate: formatDate(customer.createdAt),
    nextRenewalDate: formatDate(membership?.renewalDate ?? null),
    recentInteractions: summary.interactions.slice(0, 3).map((interaction) => ({
      id: interaction.id,
      type: interaction.title,
      description: interaction.body ?? interaction.title,
      date: formatDateTime(interaction.createdAt),
    })),
    metrics: {
      totalInvoices: summary.billingEvents.length,
      lastPaymentDate: formatDate(
        summary.billingEvents.find((event) => event.status === "PAID")?.date ?? null
      ) || "—",
      accountBalance: "$0.00",
      lifetimeValue: formatCurrency(
        summary.billingEvents
          .filter((event) => event.status === "PAID")
          .reduce((acc, event) => acc + event.amountCents, 0)
      ),
    },
  };

  const profileTabData = {
    personalDetails: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      preferredName: customer.preferredName ?? customer.firstName,
      dateOfBirth: customer.dateOfBirth?.slice(0, 10) ?? "",
    },
    contactInformation: {
      primaryEmail: customer.primaryEmail ?? "",
      primaryPhone: customer.primaryPhone ?? "",
      secondaryPhones: customer.secondaryPhone ? [customer.secondaryPhone] : [],
      address: {
        street: customer.addressLine1 ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        zip: customer.postalCode ?? "",
      },
    },
    tags: customer.tags ?? [],
    communicationPreferences: {
      canEmail: customer.canEmail,
      canSMS: customer.canSms,
    },
    customFields: [],
  };

  const apiMembers =
    summary.household?.members?.map((member) => ({
      id: member.customerProfile.id,
      name: `${member.customerProfile.firstName} ${member.customerProfile.lastName}`,
      relationship: member.relationship ?? "Member",
      status:
        STATUS_TO_BADGE[member.customerProfile.status] ?? STATUS_TO_BADGE.LEAD,
      isHead: member.customerProfile.id === summary.household?.headCustomerProfileId,
    })) ?? [];

  const headProfile =
    summary.household?.headCustomerProfile ??
    summary.household?.members
      ?.map((member) => member.customerProfile)
      .find((profile) => profile.id === summary.household?.headCustomerProfileId);

  const headMember = headProfile
    ? {
        id: headProfile.id,
        name: `${headProfile.firstName} ${headProfile.lastName}`,
        relationship: "Head of household",
        status: STATUS_TO_BADGE[headProfile.status] ?? STATUS_TO_BADGE.LEAD,
        isHead: true,
      }
    : undefined;

  const householdMembers = headMember
    ? [
        headMember,
        ...apiMembers.filter((member) => member.id !== headMember.id),
      ]
    : apiMembers;

  const householdData = summary.household
    ? {
        hasHousehold: true,
        isHead: summary.household.headCustomerProfileId === customer.id,
        headOfHousehold:
          headMember ?? householdMembers.find((member) => member.isHead) ?? undefined,
        members: householdMembers,
      }
    : {
        hasHousehold: false,
        isHead: false,
        members: [] as typeof householdMembers,
      };

  const membershipData = {
    hasMembership: Boolean(membership),
    currentMembership: membership
      ? {
          planId: membershipPlanDetails?.id,
          planName: membershipPlanName ?? "Unknown plan",
          status: mapMembershipStatus(membership.status),
          scope: membershipScope,
          locations: membershipLocations,
          startDate: formatDate(membership.startDate),
          endDate: membership.endDate ? formatDate(membership.endDate) : undefined,
          renewalDate: membership.renewalDate ? formatDate(membership.renewalDate) : undefined,
          cadence: membershipCadence,
          price: membershipPrice,
          termType: membershipTermType,
          introductoryPeriod: membershipIntroPeriod,
        }
      : undefined,
    pastMemberships: [],
  };

  const billingHistory = summary.billingEvents.map((event) => ({
    id: event.id,
    date: formatDate(event.date),
    description: event.description ?? "Billing event",
    amount: formatCurrency(event.amountCents, event.currency),
    status: event.status.toLowerCase() as "paid" | "pending" | "failed" | "refunded",
    invoiceUrl: event.externalInvoiceId ?? undefined,
  }));

  const interactions = summary.interactions.map((interaction) => ({
    id: interaction.id,
    type:
      INTERACTION_TYPE_MAP[interaction.interactionType] ?? "note",
    timestamp: formatDateTime(interaction.createdAt),
    staffUser: interaction.createdBy?.name ?? "Team member",
    summary: interaction.title,
    body: interaction.body ?? "",
    isOutbound: ["EMAIL", "SMS"].includes(interaction.interactionType),
  }));

  const files = summary.files.map((file) => ({
    id: file.id,
    name: file.fileName,
    category: FILE_CATEGORY_MAP[file.category] ?? "other",
    uploadedBy: file.uploadedByUserId,
    uploadedDate: formatDate(file.uploadedAt),
    size: formatBytes(file.sizeBytes),
  }));

  const changeHistory: Array<{
    id: string;
    timestamp: string;
    staffUser: string;
    category: "contact" | "profile" | "membership" | "household" | "billing";
    fieldChanged: string;
    oldValue: string;
    newValue: string;
  }> = [];

  return (
    <div className="space-y-6">
      <CustomerProfileHeader
        customerName={
          customer.preferredName?.trim()
            ? customer.preferredName
            : `${customer.firstName} ${customer.lastName}`
        }
        status={badgeStatus}
        primaryLocation={primaryLocation}
        onEditProfile={() => setIsEditDialogOpen(true)}
        onSendEmail={() => console.log("Send email")}
        onSendSMS={() => console.log("Send SMS")}
      />

      <CustomerInfoStrip
        householdRole={
          householdData.hasHousehold && householdData.isHead
            ? "Head of household"
            : "Household member"
        }
        membershipPlan={membershipPlanName}
        membershipStatus={membershipStatusLabel}
        nextRenewalDate={overviewData.nextRenewalDate}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="household">Household</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="interactions">Interactions & Comms</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab data={overviewData} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab data={profileTabData} />
        </TabsContent>

        <TabsContent value="household" className="mt-6">
          <HouseholdTab
            data={householdData}
            currentCustomerId={customer.id}
            onRefresh={fetchSummary}
            onViewProfile={onNavigateToCustomer}
          />
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <MembershipTab
            customerId={customer.id}
            data={membershipData}
            onMembershipUpdated={fetchSummary}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingHistoryTab records={billingHistory} />
        </TabsContent>

        <TabsContent value="interactions" className="mt-6">
          <InteractionsTab interactions={interactions} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FilesTab files={files} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ChangeHistoryTab changes={changeHistory} />
        </TabsContent>
      </Tabs>

      <EditCustomerProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customerId={customer.id}
        defaultValues={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          preferredName: customer.preferredName,
          primaryEmail: customer.primaryEmail,
          primaryPhone: customer.primaryPhone,
          addressLine1: customer.addressLine1,
          city: customer.city,
          state: customer.state,
          postalCode: customer.postalCode,
          canEmail: customer.canEmail,
          canSms: customer.canSms,
        }}
        onSaved={fetchSummary}
      />
    </div>
  );
}