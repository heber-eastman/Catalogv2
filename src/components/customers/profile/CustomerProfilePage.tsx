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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

// Mock customer profile data
const mockCustomerProfile = {
  id: "1",
  name: "Sarah Johnson",
  status: "active" as CustomerStatus,
  primaryLocation: "North Club",
  householdRole: "Head of household" as const,
  membershipPlan: "Premium",
  membershipStatus: "Active",
  joinDate: "January 15, 2022",
  nextRenewalDate: "January 15, 2025",
  email: "sarah.johnson@email.com",
  phone: "(555) 123-4567",
  address: {
    street: "123 Main Street",
    city: "Springfield",
    state: "CA",
    zip: "90210",
  },
  tags: ["VIP", "Board Member", "Golf League"],
  recentInteractions: [
    {
      id: "1",
      type: "Email Sent",
      description: "Monthly newsletter delivered",
      date: "2 days ago",
    },
    {
      id: "2",
      type: "Payment Received",
      description: "Monthly dues - $250.00",
      date: "5 days ago",
    },
    {
      id: "3",
      type: "Profile Updated",
      description: "Contact information changed",
      date: "1 week ago",
    },
  ],
  metrics: {
    totalInvoices: 36,
    lastPaymentDate: "November 14, 2025",
    accountBalance: "$0.00",
    lifetimeValue: "$9,000.00",
  },
  // Profile tab data
  profileData: {
    personalDetails: {
      firstName: "Sarah",
      lastName: "Johnson",
      preferredName: "Sarah",
      dateOfBirth: "1985-06-15",
    },
    contactInformation: {
      primaryEmail: "sarah.johnson@email.com",
      primaryPhone: "(555) 123-4567",
      secondaryPhones: ["(555) 987-6543"],
      address: {
        street: "123 Main Street",
        city: "Springfield",
        state: "CA",
        zip: "90210",
      },
    },
    tags: ["VIP", "Board Member", "Golf League"],
    communicationPreferences: {
      canEmail: true,
      canSMS: true,
    },
    customFields: [
      {
        id: "emergency-contact",
        label: "Emergency Contact",
        type: "text" as const,
        value: "John Johnson - (555) 111-2222",
      },
      {
        id: "preferred-tee-time",
        label: "Preferred Tee Time",
        type: "dropdown" as const,
        value: "Morning (7-10am)",
        options: ["Morning (7-10am)", "Midday (10am-2pm)", "Afternoon (2-6pm)"],
      },
      {
        id: "membership-anniversary",
        label: "Membership Anniversary",
        type: "date" as const,
        value: "2022-01-15",
      },
    ],
  },
  // Household tab data
  householdData: {
    hasHousehold: true,
    isHead: true,
    members: [
      {
        id: "1",
        name: "Sarah Johnson",
        relationship: "Primary Member",
        status: "active" as CustomerStatus,
        isHead: true,
      },
      {
        id: "2",
        name: "John Johnson",
        relationship: "Spouse",
        status: "active" as CustomerStatus,
        isHead: false,
      },
      {
        id: "3",
        name: "Emma Johnson",
        relationship: "Child",
        status: "active" as CustomerStatus,
        isHead: false,
      },
      {
        id: "4",
        name: "Michael Johnson",
        relationship: "Child",
        status: "trial" as CustomerStatus,
        isHead: false,
      },
    ],
  },
  // Membership tab data
  membershipData: {
    hasMembership: true,
    currentMembership: {
      planName: "Premium Family Membership",
      status: "active" as const,
      scope: "organization" as const,
      startDate: "January 15, 2022",
      renewalDate: "January 15, 2025",
      cadence: "Annual",
      price: "$3,000/year",
      termType: "Recurring",
      introductoryPeriod: "First month free",
    },
    pastMemberships: [
      {
        id: "1",
        planName: "Individual Membership",
        status: "Upgraded",
        startDate: "January 15, 2020",
        endDate: "January 14, 2022",
        reason: "Upgraded to family plan",
      },
    ],
  },
  // Billing History tab data
  billingHistory: [
    {
      id: "1",
      date: "Nov 1, 2025",
      description: "Monthly membership dues - November 2025",
      amount: "$250.00",
      status: "paid" as const,
      invoiceUrl: "#",
    },
    {
      id: "2",
      date: "Oct 1, 2025",
      description: "Monthly membership dues - October 2025",
      amount: "$250.00",
      status: "paid" as const,
      invoiceUrl: "#",
    },
    {
      id: "3",
      date: "Sep 15, 2025",
      description: "Guest fee - Golf outing",
      amount: "$75.00",
      status: "paid" as const,
      invoiceUrl: "#",
    },
    {
      id: "4",
      date: "Sep 1, 2025",
      description: "Monthly membership dues - September 2025",
      amount: "$250.00",
      status: "paid" as const,
      invoiceUrl: "#",
    },
    {
      id: "5",
      date: "Aug 1, 2025",
      description: "Monthly membership dues - August 2025",
      amount: "$250.00",
      status: "pending" as const,
    },
  ],
  // Interactions tab data
  interactions: [
    {
      id: "1",
      type: "email" as const,
      timestamp: "Nov 17, 2025 at 2:30 PM",
      staffUser: "Jessica Martinez",
      summary: "Monthly newsletter sent",
      body: "Sent monthly newsletter with upcoming events and facility updates.",
      isOutbound: true,
    },
    {
      id: "2",
      type: "phone" as const,
      timestamp: "Nov 15, 2025 at 10:15 AM",
      staffUser: "Michael Chen",
      summary: "Called regarding tee time booking",
      body: "Customer called to book a tee time for November 20th. Reserved 8:00 AM slot for four players.",
      isOutbound: false,
    },
    {
      id: "3",
      type: "note" as const,
      timestamp: "Nov 10, 2025 at 3:45 PM",
      staffUser: "Sarah Williams",
      summary: "Board meeting attendance",
      body: "Customer attended monthly board meeting. Discussed upcoming facility renovations.",
      isOutbound: false,
    },
    {
      id: "4",
      type: "sms" as const,
      timestamp: "Nov 8, 2025 at 9:00 AM",
      staffUser: "Automated System",
      summary: "Payment confirmation",
      body: "Your payment of $250.00 has been received. Thank you!",
      isOutbound: true,
    },
    {
      id: "5",
      type: "automation" as const,
      timestamp: "Nov 1, 2025 at 12:00 AM",
      staffUser: "System",
      summary: "Membership auto-renewed",
      body: "Membership successfully renewed for November 2025. Payment processed automatically.",
      isOutbound: false,
    },
  ],
  // Files tab data
  files: [
    {
      id: "1",
      name: "Membership_Agreement_2022.pdf",
      category: "contract" as const,
      uploadedBy: "Admin Staff",
      uploadedDate: "Jan 15, 2022",
      size: "245 KB",
      url: "#",
    },
    {
      id: "2",
      name: "ID_Verification.jpg",
      category: "image" as const,
      uploadedBy: "Sarah Williams",
      uploadedDate: "Jan 15, 2022",
      size: "1.2 MB",
      url: "#",
    },
    {
      id: "3",
      name: "Annual_Invoice_2025.pdf",
      category: "invoice" as const,
      uploadedBy: "Billing System",
      uploadedDate: "Jan 1, 2025",
      size: "156 KB",
      url: "#",
    },
    {
      id: "4",
      name: "Medical_Waiver.pdf",
      category: "document" as const,
      uploadedBy: "Admin Staff",
      uploadedDate: "Jan 15, 2022",
      size: "89 KB",
      url: "#",
    },
  ],
  // Change History tab data
  changeHistory: [
    {
      id: "1",
      timestamp: "Nov 10, 2025 3:45 PM",
      staffUser: "Sarah Williams",
      category: "contact" as const,
      fieldChanged: "Primary Phone",
      oldValue: "(555) 123-4566",
      newValue: "(555) 123-4567",
    },
    {
      id: "2",
      timestamp: "Oct 15, 2025 10:20 AM",
      staffUser: "Michael Chen",
      category: "profile" as const,
      fieldChanged: "Tags",
      oldValue: "VIP, Board Member",
      newValue: "VIP, Board Member, Golf League",
    },
    {
      id: "3",
      timestamp: "Sep 5, 2025 2:15 PM",
      staffUser: "Jessica Martinez",
      category: "membership" as const,
      fieldChanged: "Membership Status",
      oldValue: "Trial",
      newValue: "Active",
    },
    {
      id: "4",
      timestamp: "Jun 20, 2025 11:30 AM",
      staffUser: "Admin Staff",
      category: "household" as const,
      fieldChanged: "Household Member Added",
      oldValue: "",
      newValue: "Michael Johnson (Child)",
    },
    {
      id: "5",
      timestamp: "Jan 15, 2025 9:00 AM",
      staffUser: "Billing System",
      category: "billing" as const,
      fieldChanged: "Membership Renewed",
      oldValue: "2024 Annual Plan",
      newValue: "2025 Annual Plan",
    },
    {
      id: "6",
      timestamp: "Jan 15, 2024 9:00 AM",
      staffUser: "Billing System",
      category: "billing" as const,
      fieldChanged: "Membership Renewed",
      oldValue: "2023 Annual Plan",
      newValue: "2024 Annual Plan",
    },
  ],
};

interface CustomerProfilePageProps {
  customerId?: string;
  onBack?: () => void;
}

export function CustomerProfilePage({
  customerId,
  onBack,
}: CustomerProfilePageProps) {
  const [activeTab, setActiveTab] = React.useState("overview");

  // In a real app, fetch customer data based on customerId
  const customer = mockCustomerProfile;

  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  const handleSendEmail = () => {
    console.log("Send email");
  };

  const handleSendSMS = () => {
    console.log("Send SMS");
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <CustomerProfileHeader
        customerName={customer.name}
        status={customer.status}
        primaryLocation={customer.primaryLocation}
        onEditProfile={handleEditProfile}
        onSendEmail={handleSendEmail}
        onSendSMS={handleSendSMS}
      />

      {/* Info Strip */}
      <CustomerInfoStrip
        householdRole={customer.householdRole}
        membershipPlan={customer.membershipPlan}
        membershipStatus={customer.membershipStatus}
        nextRenewalDate={customer.nextRenewalDate}
      />

      {/* Tertiary Navigation - Tabs */}
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

        {/* Tab Content */}
        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            data={{
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              tags: customer.tags,
              membershipPlan: customer.membershipPlan,
              membershipStatus: customer.membershipStatus,
              joinDate: customer.joinDate,
              nextRenewalDate: customer.nextRenewalDate,
              recentInteractions: customer.recentInteractions,
              metrics: customer.metrics,
            }}
          />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab data={customer.profileData} />
        </TabsContent>

        <TabsContent value="household" className="mt-6">
          <HouseholdTab data={customer.householdData} currentCustomerId={customer.id} />
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <MembershipTab data={customer.membershipData} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingHistoryTab records={customer.billingHistory} />
        </TabsContent>

        <TabsContent value="interactions" className="mt-6">
          <InteractionsTab interactions={customer.interactions} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FilesTab files={customer.files} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ChangeHistoryTab changes={customer.changeHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}