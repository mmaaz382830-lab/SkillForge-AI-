"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { dashboardRoutes } from "@/config/routes";
import { softDeleteMaterialAction } from "@/lib/materials/actions";

type DeleteMaterialButtonProps = {
  materialId: string;
  materialTitle: string;
  redirectAfterDelete?: boolean;
  size?: "sm" | "md";
};

type Feedback = {
  variant: ToastVariant;
  title: string;
  description?: string;
};

export function DeleteMaterialButton({
  materialId,
  materialTitle,
  redirectAfterDelete = false,
  size = "sm",
}: DeleteMaterialButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleDelete() {
    setFeedback(null);
    setDeleting(true);

    try {
      const result = await softDeleteMaterialAction(materialId);

      if (!result.ok) {
        setFeedback({
          variant: "error",
          title: result.error,
        });
        return;
      }

      setFeedback({
        variant: "success",
        title: "Material deleted.",
        description: "This material is hidden from your library and dashboard.",
      });
      setConfirming(false);

      if (redirectAfterDelete) {
        router.push(dashboardRoutes.materials);
      }

      router.refresh();
    } catch (error) {
      console.error("[materials:delete] Unhandled error:", error);
      setFeedback({
        variant: "error",
        title: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="grid gap-2">
        <Button
          disabled={deleting}
          onClick={() => setConfirming(true)}
          size={size}
          type="button"
          variant="danger"
        >
          Delete
        </Button>
        {feedback ? (
          <Toast
            description={feedback.description}
            title={feedback.title}
            variant={feedback.variant}
          />
        ) : null}
      </div>

      <Modal
        description="This uses a soft delete. The original private file is not exposed or downloaded."
        onClose={() => {
          if (!deleting) {
            setConfirming(false);
          }
        }}
        open={confirming}
        title="Delete this material?"
      >
        <div className="grid gap-4">
          <div className="rounded-lg border-2 border-black bg-accent-pink p-4 shadow-brutal-sm">
            <p className="font-black">{materialTitle}</p>
            <p className="mt-2 text-sm font-semibold leading-6">
              Deleted materials disappear from your materials list, detail pages,
              and dashboard recent materials.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={deleting}
              loading={deleting}
              onClick={handleDelete}
              size="sm"
              type="button"
              variant="danger"
            >
              Delete material
            </Button>
            <Button
              disabled={deleting}
              onClick={() => setConfirming(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Keep material
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
