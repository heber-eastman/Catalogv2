import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react";

type ImportStep = "upload" | "map" | "duplicates" | "summary";

interface FieldMapping {
  systemField: string;
  csvColumn: string;
}

interface DuplicateCandidate {
  id: string;
  csvName: string;
  csvEmail: string;
  existingName: string;
  existingEmail: string;
  matchReason: string;
  action: "merge" | "skip";
}

const systemFields = [
  { id: "first_name", label: "First Name", required: true },
  { id: "last_name", label: "Last Name", required: true },
  { id: "email", label: "Email", required: true },
  { id: "phone", label: "Phone", required: false },
  { id: "address_street", label: "Street Address", required: false },
  { id: "address_city", label: "City", required: false },
  { id: "address_state", label: "State", required: false },
  { id: "address_zip", label: "ZIP Code", required: false },
  { id: "status", label: "Status", required: false },
  { id: "tags", label: "Tags", required: false },
  { id: "membership_plan", label: "Membership Plan", required: false },
  { id: "location", label: "Location", required: false },
];

const mockCsvColumns = [
  "(Unmapped)",
  "Customer Name",
  "Email Address",
  "Phone Number",
  "Street",
  "City",
  "State/Province",
  "Postal Code",
  "Member Status",
  "Plan Type",
  "Home Location",
  "Notes",
];

const mockDuplicates: DuplicateCandidate[] = [
  {
    id: "1",
    csvName: "John Smith",
    csvEmail: "john.smith@email.com",
    existingName: "John Smith",
    existingEmail: "john.smith@email.com",
    matchReason: "Email match",
    action: "merge",
  },
  {
    id: "2",
    csvName: "Sarah Johnson",
    csvEmail: "sarah.j@email.com",
    existingName: "Sarah Johnson",
    existingEmail: "sarahj@email.com",
    matchReason: "Name match",
    action: "skip",
  },
  {
    id: "3",
    csvName: "Michael Chen",
    csvEmail: "m.chen@email.com",
    existingName: "Michael Chen",
    existingEmail: "m.chen@email.com",
    matchReason: "Email match",
    action: "merge",
  },
];

export function CustomerSettingsImportExportPage() {
  const [importStep, setImportStep] = React.useState<ImportStep>("upload");
  const [uploadedFile, setUploadedFile] = React.useState<{
    name: string;
    size: string;
    valid: boolean;
  } | null>(null);
  const [fieldMappings, setFieldMappings] = React.useState<FieldMapping[]>(
    systemFields.map((field) => ({
      systemField: field.id,
      csvColumn: "",
    }))
  );
  const [duplicates, setDuplicates] = React.useState(mockDuplicates);
  const [exportOption, setExportOption] = React.useState<"all" | "filtered">("all");

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadedFile({
      name: "customers_import.csv",
      size: "245 KB",
      valid: true,
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setImportStep("upload");
  };

  const handleNextStep = () => {
    if (importStep === "upload") setImportStep("map");
    else if (importStep === "map") setImportStep("duplicates");
    else if (importStep === "duplicates") setImportStep("summary");
  };

  const handlePreviousStep = () => {
    if (importStep === "map") setImportStep("upload");
    else if (importStep === "duplicates") setImportStep("map");
    else if (importStep === "summary") setImportStep("duplicates");
  };

  const handleMappingChange = (systemField: string, csvColumn: string) => {
    setFieldMappings(
      fieldMappings.map((mapping) =>
        mapping.systemField === systemField
          ? { ...mapping, csvColumn }
          : mapping
      )
    );
  };

  const handleDuplicateAction = (id: string, action: "merge" | "skip") => {
    setDuplicates(
      duplicates.map((dup) => (dup.id === id ? { ...dup, action } : dup))
    );
  };

  const handleExport = () => {
    // Simulate export
    alert(`Exporting ${exportOption === "all" ? "all" : "filtered"} customers...`);
  };

  const steps = [
    { id: "upload", label: "Upload file", number: 1 },
    { id: "map", label: "Map fields", number: 2 },
    { id: "duplicates", label: "Review duplicates", number: 3 },
    { id: "summary", label: "Summary", number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === importStep);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2>Customer Import & Export</h2>
        <p className="text-muted-foreground">
          Bulk import customers from CSV or export your customer data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Customers
            </CardTitle>
            <CardDescription>
              Upload a CSV file to bulk import customer records. Use our template to
              ensure proper formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stepper */}
            <div className="space-y-4">
              <nav aria-label="Import progress">
                <ol className="flex items-center justify-between" role="list">
                  {steps.map((step, index) => (
                    <li key={step.id} className="flex-1">
                      <div className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                              index < currentStepIndex
                                ? "border-primary bg-primary text-primary-foreground"
                                : index === currentStepIndex
                                ? "border-primary text-primary"
                                : "border-muted-foreground text-muted-foreground"
                            }`}
                            aria-current={index === currentStepIndex ? "step" : undefined}
                          >
                            {index < currentStepIndex ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <span>{step.number}</span>
                            )}
                          </div>
                          <span
                            className={`mt-2 text-sm hidden sm:block ${
                              index <= currentStepIndex
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-2 ${
                              index < currentStepIndex ? "bg-primary" : "bg-muted"
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
              {/* Step 1: Upload File */}
              {importStep === "upload" && (
                <div className="space-y-4">
                  <h3>Upload CSV File</h3>

                  {!uploadedFile ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <p>Drag and drop your CSV file here, or</p>
                        <Button onClick={handleFileUpload}>Browse Files</Button>
                      </div>
                      <p className="text-muted-foreground">
                        Maximum file size: 10 MB
                      </p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-10 w-10 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{uploadedFile.name}</p>
                            <p className="text-muted-foreground">
                              {uploadedFile.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.valid ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Invalid
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 p-3 bg-muted/50 rounded border border-border">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          File format is correct
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Found 247 rows
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Detected 11 columns
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <a
                      href="#"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download CSV template
                    </a>
                  </div>
                </div>
              )}

              {/* Step 2: Map Fields */}
              {importStep === "map" && (
                <div className="space-y-4">
                  <h3>Map CSV Columns to System Fields</h3>
                  <p className="text-muted-foreground">
                    Match your CSV columns to the appropriate customer fields
                  </p>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {systemFields.map((field) => {
                      const mapping = fieldMappings.find(
                        (m) => m.systemField === field.id
                      );
                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-2 gap-4 items-center p-3 border border-border rounded-lg"
                        >
                          <div className="space-y-1">
                            <Label htmlFor={`map-${field.id}`}>
                              {field.label}
                              {field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </Label>
                            <p className="text-muted-foreground">System field</p>
                          </div>
                          <Select
                            value={mapping?.csvColumn || ""}
                            onValueChange={(value) =>
                              handleMappingChange(field.id, value)
                            }
                          >
                            <SelectTrigger id={`map-${field.id}`}>
                              <SelectValue placeholder="Select CSV column..." />
                            </SelectTrigger>
                            <SelectContent>
                              {mockCsvColumns.map((column) => (
                                <SelectItem key={column} value={column}>
                                  {column}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Review Duplicates */}
              {importStep === "duplicates" && (
                <div className="space-y-4">
                  <h3>Review Potential Duplicates</h3>
                  <p className="text-muted-foreground">
                    We found {duplicates.length} potential duplicate(s). Choose to
                    merge or skip each one.
                  </p>

                  <div className="space-y-3">
                    {duplicates.map((duplicate) => (
                      <div
                        key={duplicate.id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">CSV Data:</p>
                                <p>{duplicate.csvName}</p>
                                <p className="text-muted-foreground">
                                  {duplicate.csvEmail}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Existing Customer:
                                </p>
                                <p>{duplicate.existingName}</p>
                                <p className="text-muted-foreground">
                                  {duplicate.existingEmail}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{duplicate.matchReason}</Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button
                            variant={
                              duplicate.action === "merge" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleDuplicateAction(duplicate.id, "merge")}
                          >
                            Merge & Update
                          </Button>
                          <Button
                            variant={
                              duplicate.action === "skip" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleDuplicateAction(duplicate.id, "skip")}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Summary */}
              {importStep === "summary" && (
                <div className="space-y-4">
                  <h3>Import Complete</h3>

                  <div className="space-y-4 p-6 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div>
                        <p>Import completed successfully</p>
                        <p className="text-muted-foreground">
                          Your customers have been imported
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Created</p>
                        <p>
                          <span className="text-green-600">192</span> customers
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Updated</p>
                        <p>
                          <span className="text-blue-600">52</span> customers
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Skipped</p>
                        <p>
                          <span className="text-muted-foreground">3</span>{" "}
                          customers
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setImportStep("upload");
                      setUploadedFile(null);
                    }}
                    className="w-full"
                  >
                    Import Another File
                  </Button>
                </div>
              )}
            </div>

            {/* Step Navigation */}
            {importStep !== "summary" && (
              <div className="flex justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={importStep === "upload"}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={importStep === "upload" && !uploadedFile}
                  className="gap-2"
                >
                  {importStep === "duplicates" ? "Complete Import" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Customers
            </CardTitle>
            <CardDescription>
              Download your customer data as a CSV file for backup or analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3>Select Export Scope</h3>

              <RadioGroup value={exportOption} onValueChange={(v) => setExportOption(v as "all" | "filtered")}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="all" id="export-all" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="export-all" className="cursor-pointer">
                        Export all customers
                      </Label>
                      <p className="text-muted-foreground">
                        Download complete customer database (1,247 records)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem
                      value="filtered"
                      id="export-filtered"
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="export-filtered" className="cursor-pointer">
                        Export filtered customers
                      </Label>
                      <p className="text-muted-foreground">
                        Export only customers matching your current filters from the
                        People list
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h3>Export Fields</h3>
              <p className="text-muted-foreground">
                Your export will include the following data:
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Name & Contact Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Membership Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Status & Tags</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Location Assignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Custom Fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Created & Updated Dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Billing History</span>
                </div>
              </div>
            </div>

            <Button onClick={handleExport} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p>Data Privacy Notice</p>
                  <p className="text-muted-foreground">
                    Exported files contain sensitive customer information. Please
                    handle with care and follow your organization's data protection
                    policies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3>Import & Export Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                Use the CSV template to ensure your import file has the correct
                format
              </li>
              <li>
                Required fields: First Name, Last Name, and Email are mandatory for
                all imports
              </li>
              <li>
                Duplicate detection uses email addresses and phone numbers to find
                matches
              </li>
              <li>
                When merging duplicates, CSV data will update existing customer
                records
              </li>
              <li>
                Exports preserve all custom fields and special characters with UTF-8
                encoding
              </li>
              <li>
                Large exports (1000+ records) may take a few moments to process
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
