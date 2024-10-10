// plane editor
import { TFileHandler } from "@plane/editor";
// helpers
import { getFileURL } from "@/helpers/file.helper";
import { checkURLValidity } from "@/helpers/string.helper";
// services
import { FileService } from "@/services/file.service";
const fileService = new FileService();

type TEditorSrcArgs = {
  assetId: string;
  projectId?: string;
  workspaceSlug: string;
};

/**
 * @description generate the file source using assetId
 * @param {TEditorSrcArgs} args
 */
export const getEditorAssetSrc = (args: TEditorSrcArgs): string | undefined => {
  const { assetId, projectId, workspaceSlug } = args;
  let url: string | undefined = "";
  if (projectId) {
    url = getFileURL(`/api/assets/v2/workspaces/${workspaceSlug}/projects/${projectId}/${assetId}/`);
  } else {
    url = getFileURL(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`);
  }
  return url;
};

type TArgs = {
  maxFileSize: number;
  projectId?: string;
  uploadFile: (file: File) => Promise<string>;
  workspaceId: string;
  workspaceSlug: string;
};

/**
 * @description this function returns the file handler required by the editors
 * @param {TArgs} args
 */
export const getEditorFileHandlers = (args: TArgs): TFileHandler => {
  const { maxFileSize, projectId, uploadFile, workspaceId, workspaceSlug } = args;

  return {
    getAssetSrc: (path) => {
      if (!path) return "";
      if (checkURLValidity(path)) {
        return path;
      } else {
        return (
          getEditorAssetSrc({
            assetId: path,
            projectId,
            workspaceSlug,
          }) ?? ""
        );
      }
    },
    upload: uploadFile,
    delete: async (src: string) => {
      if (checkURLValidity(src)) {
        await fileService.deleteOldEditorAsset(workspaceId, src);
      } else {
        await fileService.deleteNewAsset(
          getEditorAssetSrc({
            assetId: src,
            projectId,
            workspaceSlug,
          }) ?? ""
        );
      }
    },
    restore: async (src: string) => {
      if (checkURLValidity(src)) {
        await fileService.restoreOldEditorAsset(workspaceId, src);
      } else {
        await fileService.restoreNewAsset(workspaceSlug, src);
      }
    },
    cancel: fileService.cancelUpload,
    validation: {
      maxFileSize,
    },
  };
};

/**
 * @description this function returns the file handler required by the read-only editors
 */
export const getReadOnlyEditorFileHandlers = (
  args: Pick<TArgs, "projectId" | "workspaceSlug">
): { getAssetSrc: TFileHandler["getAssetSrc"] } => {
  const { projectId, workspaceSlug } = args;

  return {
    getAssetSrc: (path) => {
      if (!path) return "";
      if (checkURLValidity(path)) {
        return path;
      } else {
        return (
          getEditorAssetSrc({
            assetId: path,
            projectId,
            workspaceSlug,
          }) ?? ""
        );
      }
    },
  };
};
