import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Plus, Pencil, GripVertical, Trash2, Settings2 } from "lucide-react";

type FieldType = "text" | "number" | "date" | "dropdown";

interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  active: boolean;
  displayOrder: number;
  options?: string[]; // for dropdown type
}

const mockCustomFields: CustomField[] = [
  {
    id: "1",
    label: "Emergency Contact",
    type: "text",
    required: true,
    active: true,
    displayOrder: 1,
  },
  {
    id: "2",
    label: "Preferred Tee Time",
    type: "dropdown",
    required: false,
    active: true,
    displayOrder: 2,
    options: ["Morning (7-10am)", "Midday (10am-2pm)", "Afternoon (2-6pm)"],
  },
  {
    id: "3",
    label: "Membership Anniversary",
    type: "date",
    required: false,
    active: true,
    displayOrder: 3,
  },
  {
    id: "4",
    label: "Locker Number",
    type: "number",
    required: false,
    active: false,
    displayOrder: 4,
  },
];

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  dropdown: "Dropdown",
};

export function CustomerSettingsCustomFieldsPage() {
  const [customFields, setCustomFields] = React.useState(mockCustomFields);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<CustomField | null>(null);
  const [formData, setFormData] = React.useState<Partial<CustomField>>({
    label: "",
    type: "text",
    required: false,
    active: true,
    displayOrder: 1,
    options: [],
  });
  const [newOption, setNewOption] = React.useState("");

  const handleNewField = () => {
    setEditingField(null);
    setFormData({
      label: "",
      type: "text",
      required: false,
      active: true,
      displayOrder: customFields.length + 1,
      options: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setFormData({ ...field });
    setIsDialogOpen(true);
  };

  const handleSaveField = () => {
    if (editingField) {
      // Update existing field
      setCustomFields(
        customFields.map((f) =>
          f.id === editingField.id ? { ...editingField, ...formData } as CustomField : f
        )
      );
    } else {
      // Create new field
      const { id: _unused, ...fieldWithoutId } = formData as CustomField;
      const newField: CustomField = {
        id: (customFields.length + 1).toString(),
        ...(fieldWithoutId as Omit<CustomField, "id">),
      };
      setCustomFields([...customFields, newField]);
    }
    setIsDialogOpen(false);
  };

  const handleToggleActive = (fieldId: string) => {
    setCustomFields(
      customFields.map((f) => (f.id === fieldId ? { ...f, active: !f.active } : f))
    );
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()],
      });
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index),
    });
  };

  const handleMoveOption = (index: number, direction: "up" | "down") => {
    if (!formData.options) return;

    const newOptions = [...formData.options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOptions.length) return;

    [newOptions[index], newOptions[targetIndex]] = [
      newOptions[targetIndex],
      newOptions[index],
    ];

    setFormData({ ...formData, options: newOptions });
  };

  const sortedFields = [...customFields].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2>Custom Fields</h2>
          <p className="text-muted-foreground">
            Create custom data fields for customer profiles
          </p>
        </div>
        <Button onClick={handleNewField} className="gap-2">
          <Plus className="h-4 w-4" />
          New Custom Field
        </Button>
      </div>

      {/* Custom Fields Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left" scope="col">
                      Field Label
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Required
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Display Order
                    </th>
                    <th className="px-4 py-3 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedFields.map((field) => (
                    <tr key={field.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                          {field.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {fieldTypeLabels[field.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {field.required ? (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={field.active}
                          onCheckedChange={() => handleToggleActive(field.id)}
                          aria-label={`Toggle ${field.label} active status`}
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {field.displayOrder}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditField(field)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {sortedFields.map((field) => (
              <div key={field.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p>{field.label}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">
                        {fieldTypeLabels[field.type]}
                      </Badge>
                      {field.required && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 text-xs"
                        >
                          Required
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-sm">
                        Order: {field.displayOrder}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={field.active}
                    onCheckedChange={() => handleToggleActive(field.id)}
                    aria-label={`Toggle ${field.label} active status`}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditField(field)}
                  className="w-full gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Field
                </Button>
              </div>
            ))}
          </div>

          {customFields.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No custom fields configured. Click "New Custom Field" to add one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {customFields.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                These fields will appear on the Customer Profile → Profile tab:
              </p>
              <div className="border border-border rounded-lg p-4 bg-background space-y-4">
                {sortedFields
                  .filter((f) => f.active)
                  .map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`preview-${field.id}`}>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      {field.type === "text" && (
                        <Input
                          id={`preview-${field.id}`}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          disabled
                        />
                      )}
                      {field.type === "number" && (
                        <Input
                          id={`preview-${field.id}`}
                          type="number"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          disabled
                        />
                      )}
                      {field.type === "date" && (
                        <Input
                          id={`preview-${field.id}`}
                          type="date"
                          disabled
                        />
                      )}
                      {field.type === "dropdown" && (
                        <Select disabled>
                          <SelectTrigger id={`preview-${field.id}`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Field Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Custom Field" : "New Custom Field"}
            </DialogTitle>
            <DialogDescription>
              {editingField
                ? "Update the custom field details below."
                : "Create a new custom field for customer profiles."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="Emergency Contact"
                />
                <p className="text-muted-foreground">
                  This label will appear on customer profiles
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: FieldType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (single line)</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="dropdown">Dropdown (select)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dropdown Options */}
            {formData.type === "dropdown" && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <h3>Dropdown Options</h3>

                {formData.options && formData.options.length > 0 && (
                  <ul className="space-y-2" role="list">
                    {formData.options.map((option, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 p-2 bg-background border border-border rounded"
                      >
                        <GripVertical
                          className="h-4 w-4 text-muted-foreground shrink-0 cursor-move"
                          aria-hidden="true"
                        />
                        <span className="flex-1">{option}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOption(index, "up")}
                            disabled={index === 0}
                            aria-label="Move up"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveOption(index, "down")}
                            disabled={index === formData.options!.length - 1}
                            aria-label="Move down"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            aria-label={`Remove ${option}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-option">Add Option</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder="Enter an option..."
                    />
                    <Button
                      onClick={handleAddOption}
                      disabled={!newOption.trim()}
                      className="gap-2 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="field-required">Required Field</Label>
                  <p className="text-muted-foreground">
                    Must be filled out when creating/editing customers
                  </p>
                </div>
                <Switch
                  id="field-required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, required: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-display-order">Display Order</Label>
                <Input
                  id="field-display-order"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                />
                <p className="text-muted-foreground">
                  Lower numbers appear first on the profile
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="field-active">Active</Label>
                  <p className="text-muted-foreground">
                    Field is visible and available for use
                  </p>
                </div>
                <Switch
                  id="field-active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} disabled={!formData.label?.trim()}>
              {editingField ? "Update Field" : "Create Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
