"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Edit2, Check } from "lucide-react";
import {
  attributeService,
  AttributeDefinition,
} from "@/services/attributeService";
import { toast } from "sonner";

const AttributesPage = () => {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAttrName, setNewAttrName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newValue, setNewValue] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const res = await attributeService.getAll();
      setAttributes(res.data);
    } catch (err: unknown) {
      console.error("Error fetching attributes:", err);
      toast.error("Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;

    try {
      setCreating(true);
      await attributeService.create(newAttrName.trim());
      setNewAttrName("");
      toast.success("Attribute created");
      await fetchAttributes();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create attribute";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAttribute = async (id: number, name: string) => {
    if (!window.confirm(`Delete attribute "${name}" and all its values?`))
      return;

    try {
      await attributeService.delete(id);
      toast.success("Attribute deleted");
      await fetchAttributes();
    } catch (error) {
      console.error("Error deleting attribute:", error);
      toast.error("Failed to delete attribute");
    }
  };

  const handleUpdateAttribute = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await attributeService.update(id, editingName.trim());
      setEditingId(null);
      toast.success("Attribute updated");
      await fetchAttributes();
    } catch (error) {
      console.error("Error updating attribute:", error);
      toast.error("Failed to update attribute");
    }
  };

  const handleCreateValue = async (defId: number) => {
    const value = newValue[defId];
    if (!value || !value.trim()) return;

    try {
      await attributeService.createValue(defId, value.trim());
      setNewValue({ ...newValue, [defId]: "" });
      toast.success("Value added");
      await fetchAttributes();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add value";
      toast.error(errorMessage);
    }
  };

  const handleDeleteValue = async (valId: number) => {
    try {
      await attributeService.deleteValue(valId);
      toast.success("Value removed");
      await fetchAttributes();
    } catch (error) {
      console.error("Error deleting value:", error);
      toast.error("Failed to remove value");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading attributes...</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Product Attributes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Attribute */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add New Attribute</CardTitle>
            <CardDescription>
              Create a base attribute type like &quot;Size&quot; or
              &quot;Color&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAttribute} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Size, Color, RAM"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Attribute"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List of Attributes */}
        <div className="md:col-span-2 space-y-6">
          {attributes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No attributes defined yet. Use the sidebar to add your first
                one.
              </CardContent>
            </Card>
          ) : (
            attributes.map((attr) => (
              <Card key={attr.attribute_def_id}>
                <CardHeader className="pb-3 border-b mb-4">
                  <div className="flex items-center justify-between">
                    {editingId === attr.attribute_def_id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          className="h-8 w-40"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={() =>
                            handleUpdateAttribute(attr.attribute_def_id)
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{attr.name}</CardTitle>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-50 hover:opacity-100"
                          onClick={() => {
                            setEditingId(attr.attribute_def_id);
                            setEditingName(attr.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() =>
                        handleDeleteAttribute(attr.attribute_def_id, attr.name)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {attr.values?.map((val) => (
                        <Badge
                          key={val.attribute_value_id}
                          variant="secondary"
                          className="pl-3 pr-1 py-1 gap-1"
                        >
                          {val.value}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full p-0 flex items-center justify-center hover:bg-neutral-200"
                            onClick={() =>
                              handleDeleteValue(val.attribute_value_id)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add value (e.g. Small, 8GB)..."
                        value={newValue[attr.attribute_def_id] || ""}
                        onChange={(e) =>
                          setNewValue({
                            ...newValue,
                            [attr.attribute_def_id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleCreateValue(attr.attribute_def_id)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateValue(attr.attribute_def_id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Value
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributesPage;
