import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  Upload,
  Trash2,
} from "lucide-react";

type FileCategory = "document" | "image" | "contract" | "invoice" | "other";

interface FileRecord {
  id: string;
  name: string;
  category: FileCategory;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  url?: string;
}

interface FilesTabProps {
  files: FileRecord[];
}

const categoryConfig: Record<
  FileCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  document: {
    label: "Document",
    icon: FileText,
    color: "text-blue-600",
  },
  image: {
    label: "Image",
    icon: Image,
    color: "text-green-600",
  },
  contract: {
    label: "Contract",
    icon: FileText,
    color: "text-purple-600",
  },
  invoice: {
    label: "Invoice",
    icon: FileText,
    color: "text-orange-600",
  },
  other: {
    label: "Other",
    icon: File,
    color: "text-gray-600",
  },
};

export function FilesTab({ files }: FilesTabProps) {
  const handleUpload = () => {
    console.log("Open file upload dialog");
  };

  const handleDownload = (file: FileRecord) => {
    console.log("Download file:", file.id);
  };

  const handleView = (file: FileRecord) => {
    console.log("View file:", file.id);
  };

  const handleDelete = (file: FileRecord) => {
    console.log("Delete file:", file.id);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3>No Files</h3>
              <p className="text-muted-foreground">
                No files have been uploaded for this customer yet.
              </p>
            </div>
            <Button onClick={handleUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Files</CardTitle>
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left" scope="col">
                    File Name
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Uploaded By
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {files.map((file) => {
                  const config = categoryConfig[file.category];
                  const Icon = config.icon;

                  return (
                    <tr key={file.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {file.size}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {file.uploadedBy}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {file.uploadedDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(file)}
                            aria-label={`View ${file.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            aria-label={`Download ${file.name}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file)}
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {files.map((file) => {
            const config = categoryConfig[file.category];
            const Icon = config.icon;

            return (
              <Card key={file.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="truncate">{file.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{config.label}</Badge>
                        <span className="text-muted-foreground">
                          {file.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    <p>Uploaded by {file.uploadedBy}</p>
                    <p>{file.uploadedDate}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(file)}
                      className="flex-1 gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="flex-1 gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
