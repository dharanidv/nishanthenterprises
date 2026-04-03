"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createPageApi,
  createSectionApi,
  deletePageImageApi,
  deleteSectionApi,
  fetchImagesForSection,
  fetchPageBySlug,
  fetchSectionsForPage,
  getStoredToken,
  replacePageImage,
  resolveMediaUrl,
  updatePageImageStatusApi,
  updateSectionApi,
  uploadPageImage,
  type CmsPage,
  type CmsPageImage,
  type CmsPageSection
} from "@/lib/api";
import {
  isAddSectionFormDirty,
  listUnsavedSectionTitles,
  newSectionContentPair,
  parseSectionContentToPairs,
  serializedSectionContentOrNull,
  type SectionContentPair
} from "@/lib/cmsSectionContent";

const DISPLAY_TITLES: Record<string, string> = {
  home: "Home",
  about_us: "About Us",
  contact_us: "Contact Us",
  header_footer: "Header & Footer"
};

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74M3 3v6h6M21 21v-6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImagePlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
      <path
        d="M3 15l3.5-3.5a1.5 1.5 0 0 1 2.1 0L13 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 11v6M13 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Replace / upload new file for existing image */
function ImageUploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0l4 4m-4-4L8 8M4 20h16a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="cmsIconSpinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CmsImagePreview({
  storedPath,
  onOpenPreview,
  compact
}: {
  storedPath: string;
  /** When set, click opens this URL in the parent lightbox instead of a new tab */
  onOpenPreview?: (resolvedUrl: string) => void;
  compact?: boolean;
}) {
  const src = resolveMediaUrl(storedPath);
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className={`cmsImageBroken${compact ? " cmsImageBrokenCompact" : ""}`}>
        <p className="cmsImageBrokenText">Preview unavailable</p>
        <a className="cmsImageOpenLink" href={src} target="_blank" rel="noopener noreferrer">
          Open file
        </a>
      </div>
    );
  }

  const thumbClass = compact ? "cmsThumb cmsThumbRow" : "cmsThumb";

  if (onOpenPreview) {
    return (
      <button
        type="button"
        className={`cmsImagePreviewBtn${compact ? " cmsImagePreviewBtnRow" : ""}`}
        onClick={() => onOpenPreview(src)}
        title="View full image"
        aria-label="View full image"
        aria-haspopup="dialog"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic CMS URLs from API */}
        <img
          src={src}
          alt=""
          className={thumbClass}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      </button>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="cmsImagePreviewLink"
      title="Open full size in new tab"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic CMS URLs from API */}
      <img
        src={src}
        alt=""
        className={thumbClass}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </a>
  );
}

type Props = { pageSlug: string };

function SectionContentKeyValueEditor({
  pairs,
  onPairsChange,
  disabled
}: {
  pairs: SectionContentPair[];
  onPairsChange: (next: SectionContentPair[]) => void;
  disabled?: boolean;
}) {
  function updatePair(id: string, patch: Partial<Pick<SectionContentPair, "key" | "value">>) {
    onPairsChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function removePair(id: string) {
    if (pairs.length <= 1) return;
    onPairsChange(pairs.filter((p) => p.id !== id));
  }
  function addPair() {
    onPairsChange([...pairs, newSectionContentPair()]);
  }
  return (
    <div className="cmsKvEditor">
      {pairs.map((p) => (
        <div key={p.id} className="cmsKvRow">
          <input
            className="cmsInput cmsKvKey"
            placeholder="e.g. title"
            value={p.key}
            onChange={(e) => updatePair(p.id, { key: e.target.value })}
            disabled={disabled}
            aria-label="Label, e.g. title"
          />
          <input
            className="cmsInput cmsKvValue"
            placeholder="e.g. Your real headline or text"
            value={p.value}
            onChange={(e) => updatePair(p.id, { value: e.target.value })}
            disabled={disabled}
            aria-label="Text to show for this label"
          />
          <button
            type="button"
            className="cmsBtnDangerSm"
            onClick={() => removePair(p.id)}
            disabled={disabled || pairs.length <= 1}
            title="Remove row"
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="cmsBtnGhostSm" onClick={addPair} disabled={disabled}>
        Add another field
      </button>
    </div>
  );
}

export default function CmsPageEditor({ pageSlug }: Props) {
  const router = useRouter();
  const title = DISPLAY_TITLES[pageSlug] ?? pageSlug;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [pageMissing, setPageMissing] = useState(false);
  const [sections, setSections] = useState<CmsPageSection[]>([]);
  const [imagesBySection, setImagesBySection] = useState<Record<string, CmsPageImage[]>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPage, setCreatingPage] = useState(false);

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionPairs, setNewSectionPairs] = useState<SectionContentPair[]>(() => [newSectionContentPair()]);
  const [addingSection, setAddingSection] = useState(false);

  const [contentDrafts, setContentDrafts] = useState<Record<string, SectionContentPair[]>>({});
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [uploadingSectionId, setUploadingSectionId] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [updatingImageId, setUpdatingImageId] = useState<string | null>(null);
  const [togglingStatusImageId, setTogglingStatusImageId] = useState<string | null>(null);

  const [editSection, setEditSection] = useState<CmsPageSection | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [savingSectionMeta, setSavingSectionMeta] = useState(false);
  const [imageLightboxUrl, setImageLightboxUrl] = useState<string | null>(null);

  const [leaveConfirm, setLeaveConfirm] = useState<{
    href: string;
    sectionTitles: string[];
    addForm: boolean;
  } | null>(null);

  const newImageFileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const replaceImageFileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const unsavedNavGuard = useMemo(() => {
    if (loading || pageMissing || !page) {
      return { active: false, sectionTitles: [] as string[], addForm: false };
    }
    const sectionTitles = listUnsavedSectionTitles(sections, contentDrafts);
    const addForm = isAddSectionFormDirty(newSectionName, newSectionPairs);
    return {
      active: sectionTitles.length > 0 || addForm,
      sectionTitles,
      addForm
    };
  }, [loading, page, pageMissing, sections, contentDrafts, newSectionName, newSectionPairs]);

  const navGuardRef = useRef(unsavedNavGuard);
  navGuardRef.current = unsavedNavGuard;

  const leaveConfirmRef = useRef(leaveConfirm);
  leaveConfirmRef.current = leaveConfirm;

  const [contentSavedToast, setContentSavedToast] = useState<{
    key: number;
    exiting: boolean;
  } | null>(null);
  const contentSavedToastKeyRef = useRef(0);
  const contentSavedToastTimersRef = useRef<{
    exit: ReturnType<typeof setTimeout> | null;
    hide: ReturnType<typeof setTimeout> | null;
  }>({ exit: null, hide: null });

  const showContentSavedToast = useCallback(() => {
    const timers = contentSavedToastTimersRef.current;
    if (timers.exit) clearTimeout(timers.exit);
    if (timers.hide) clearTimeout(timers.hide);
    contentSavedToastKeyRef.current += 1;
    setContentSavedToast({ key: contentSavedToastKeyRef.current, exiting: false });
    timers.exit = setTimeout(() => {
      setContentSavedToast((s) => (s ? { ...s, exiting: true } : null));
    }, 1800);
    timers.hide = setTimeout(() => {
      setContentSavedToast(null);
      timers.exit = null;
      timers.hide = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      const timers = contentSavedToastTimersRef.current;
      if (timers.exit) clearTimeout(timers.exit);
      if (timers.hide) clearTimeout(timers.hide);
    };
  }, []);

  const loadImagesForSections = useCallback(async (token: string, list: CmsPageSection[]) => {
    const entries = await Promise.all(
      list.map(async (s) => {
        const imgs = await fetchImagesForSection(token, s.id);
        return [s.id, imgs] as const;
      })
    );
    const next: Record<string, CmsPageImage[]> = {};
    for (const [id, imgs] of entries) next[id] = imgs;
    setImagesBySection(next);
  }, []);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    setPageMissing(false);
    try {
      const p = await fetchPageBySlug(token, pageSlug);
      setPage(p);
      const secs = await fetchSectionsForPage(token, p.id);
      setSections(secs);
      const drafts: Record<string, SectionContentPair[]> = {};
      for (const s of secs) drafts[s.id] = parseSectionContentToPairs(s.section_content);
      setContentDrafts(drafts);
      await loadImagesForSections(token, secs);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (/not found/i.test(msg)) {
        setPage(null);
        setPageMissing(true);
        setSections([]);
        setImagesBySection({});
        setContentDrafts({});
      } else {
        setError(msg);
        setPage(null);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSlug, router, loadImagesForSections]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!imageLightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageLightboxUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageLightboxUrl]);

  useEffect(() => {
    if (!unsavedNavGuard.active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsavedNavGuard.active]);

  useEffect(() => {
    const onDocumentClick = (e: MouseEvent) => {
      if (leaveConfirmRef.current) return;
      const g = navGuardRef.current;
      if (!g.active) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = e.target;
      if (!el || !(el instanceof Element)) return;
      const a = el.closest("a");
      if (!a || !(a instanceof HTMLAnchorElement)) return;
      if (a.getAttribute("href") == null) return;
      if (a.download) return;
      if (a.target === "_blank" || a.getAttribute("target") === "_blank") return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const dest = url.pathname + url.search + url.hash;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveConfirm({
        href: dest,
        sectionTitles: [...g.sectionTitles],
        addForm: g.addForm
      });
    };
    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  useEffect(() => {
    if (!leaveConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLeaveConfirm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leaveConfirm]);

  function handleLeaveConfirmStay() {
    setLeaveConfirm(null);
  }

  function handleLeaveConfirmDiscard() {
    const target = leaveConfirm?.href;
    if (!target) return;
    setLeaveConfirm(null);
    setContentDrafts(() => {
      const next: Record<string, SectionContentPair[]> = {};
      for (const s of sections) {
        next[s.id] = parseSectionContentToPairs(s.section_content);
      }
      return next;
    });
    setNewSectionName("");
    setNewSectionPairs([newSectionContentPair()]);
    router.push(target);
  }

  async function handleCreatePage() {
    const token = getStoredToken();
    if (!token) return;
    setCreatingPage(true);
    setError(null);
    try {
      const p = await createPageApi(token, pageSlug);
      setPage(p);
      setPageMissing(false);
      setSections([]);
      setImagesBySection({});
      setContentDrafts({});
      setNewSectionPairs([newSectionContentPair()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create page");
    } finally {
      setCreatingPage(false);
    }
  }

  async function handleAddSection(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredToken();
    if (!token || !page) return;
    const name = newSectionName.trim();
    if (!name) {
      setError("Section name is required");
      return;
    }
    setAddingSection(true);
    setError(null);
    try {
      const sec = await createSectionApi(token, {
        pageId: page.id,
        sectionName: name,
        sectionContent: serializedSectionContentOrNull(newSectionPairs)
      });
      setSections((prev) => [...prev, sec]);
      setContentDrafts((d) => ({ ...d, [sec.id]: parseSectionContentToPairs(sec.section_content) }));
      setImagesBySection((im) => ({ ...im, [sec.id]: [] }));
      setNewSectionName("");
      setNewSectionPairs([newSectionContentPair()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add section");
    } finally {
      setAddingSection(false);
    }
  }

  async function saveSectionContent(section: CmsPageSection) {
    const token = getStoredToken();
    if (!token) return;
    setSavingSectionId(section.id);
    setError(null);
    try {
      const pairs = contentDrafts[section.id] ?? [newSectionContentPair()];
      const updated = await updateSectionApi(token, section.id, {
        sectionName: section.section_name,
        sectionContent: serializedSectionContentOrNull(pairs)
      });
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setContentDrafts((d) => ({
        ...d,
        [updated.id]: parseSectionContentToPairs(updated.section_content)
      }));
      showContentSavedToast();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingSectionId(null);
    }
  }

  async function saveSectionRename() {
    const token = getStoredToken();
    if (!token || !editSection) return;
    const name = editSectionName.trim();
    if (!name) {
      setError("Section name is required");
      return;
    }
    setSavingSectionMeta(true);
    setError(null);
    try {
      const pairs =
        contentDrafts[editSection.id] ?? parseSectionContentToPairs(editSection.section_content);
      const updated = await updateSectionApi(token, editSection.id, {
        sectionName: name,
        sectionContent: serializedSectionContentOrNull(pairs)
      });
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setContentDrafts((d) => ({
        ...d,
        [updated.id]: parseSectionContentToPairs(updated.section_content)
      }));
      setEditSection(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingSectionMeta(false);
    }
  }

  async function handleDeleteSection(section: CmsPageSection) {
    if (!window.confirm(`Delete section "${section.section_name}" and its images?`)) return;
    const token = getStoredToken();
    if (!token) return;
    setDeletingSectionId(section.id);
    setError(null);
    try {
      await deleteSectionApi(token, section.id);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      setImagesBySection((im) => {
        const n = { ...im };
        delete n[section.id];
        return n;
      });
      setContentDrafts((d) => {
        const n = { ...d };
        delete n[section.id];
        return n;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingSectionId(null);
    }
  }

  function triggerNewImageFile(sectionId: string) {
    newImageFileInputs.current[sectionId]?.click();
  }

  function triggerReplaceImageFile(imageId: string) {
    replaceImageFileInputs.current[imageId]?.click();
  }

  async function onNewImageFileSelected(sectionId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const token = getStoredToken();
    if (!token) return;
    setUploadingSectionId(sectionId);
    setError(null);
    try {
      const row = await uploadPageImage(token, sectionId, file);
      setImagesBySection((im) => ({
        ...im,
        [sectionId]: [...(im[sectionId] ?? []), row]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSectionId(null);
    }
  }

  async function onReplaceImageFileSelected(img: CmsPageImage, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const token = getStoredToken();
    if (!token) return;
    setUpdatingImageId(img.id);
    setError(null);
    try {
      const updated = await replacePageImage(token, img.id, file);
      setImagesBySection((im) => ({
        ...im,
        [img.section_id]: (im[img.section_id] ?? []).map((i) => (i.id === updated.id ? updated : i))
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image update failed");
    } finally {
      setUpdatingImageId(null);
    }
  }

  async function handleToggleImageStatus(img: CmsPageImage) {
    const token = getStoredToken();
    if (!token) return;
    const current = img.status !== false;
    setTogglingStatusImageId(img.id);
    setError(null);
    try {
      const updated = await updatePageImageStatusApi(token, img.id, !current);
      setImagesBySection((im) => ({
        ...im,
        [img.section_id]: (im[img.section_id] ?? []).map((i) => (i.id === updated.id ? updated : i))
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setTogglingStatusImageId(null);
    }
  }

  async function handleDeleteImage(img: CmsPageImage) {
    if (!window.confirm("Remove this image?")) return;
    const token = getStoredToken();
    if (!token) return;
    setDeletingImageId(img.id);
    setError(null);
    try {
      await deletePageImageApi(token, img.id);
      setImagesBySection((im) => ({
        ...im,
        [img.section_id]: (im[img.section_id] ?? []).filter((i) => i.id !== img.id)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingImageId(null);
    }
  }

  if (loading) {
    return (
      <div className="cmsEditor">
        <h1 className="dashboardWelcomeTitle">{title}</h1>
        <p className="cmsLoading">Loading…</p>
      </div>
    );
  }

  if (pageMissing) {
    return (
      <div className="cmsEditor">
        <h1 className="dashboardWelcomeTitle">{title}</h1>
        <p className="dashboardWelcomeMeta">No CMS page exists for <code className="cmsCode">{pageSlug}</code>.</p>
        {error ? <div className="pagesTableError">{error}</div> : null}
        <button type="button" className="cmsBtnPrimary" onClick={() => void handleCreatePage()} disabled={creatingPage}>
          {creatingPage ? "Creating…" : "Create page"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="cmsEditor">
      <h1 className="dashboardWelcomeTitle">{title}</h1>
      <p className="dashboardWelcomeMeta">
        Page: <code className="cmsCode">{page?.page_name}</code> · ID {page?.id}
      </p>

      {error ? <div className="pagesTableError">{error}</div> : null}

      <div className="cmsTableCard">
        <div className="cmsTableToolbar">
          <span className="cmsTableToolbarLabel">Sections</span>
          <div className="pagesTableActions">
            <button
              type="button"
              className="pagesIconBtn"
              onClick={() => void refresh()}
              disabled={loading}
              title="Refresh"
              aria-label="Refresh sections"
            >
              {loading ? <SpinnerIcon /> : <RefreshIcon />}
            </button>
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="cmsEmptyHint">No sections yet. Add one below.</p>
        ) : (
          <div className="cmsSectionList">
            {sections.map((section) => {
              const imgs = imagesBySection[section.id] ?? [];
              const hasImages = imgs.length > 0;
              return (
                <section key={section.id} className="cmsSectionBlock">
                  <div className="cmsSectionTopBar">
                    <div className="cmsSectionTopBarInfo">
                      <h3 className="cmsSectionHeading">{section.section_name}</h3>
                      <p className="cmsMeta">Updated {new Date(section.updated_time).toLocaleString()}</p>
                    </div>
                    <div className="cmsSectionTopBarActions">
                      <button
                        type="button"
                        className="pagesIconBtn pagesIconBtnEdit"
                        onClick={() => {
                          setEditSection(section);
                          setEditSectionName(section.section_name);
                        }}
                        title="Edit section name"
                        aria-label={`Edit section ${section.section_name}`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="pagesIconBtn pagesIconBtnDelete"
                        onClick={() => void handleDeleteSection(section)}
                        disabled={deletingSectionId === section.id}
                        title="Delete section"
                        aria-label={`Delete section ${section.section_name}`}
                      >
                        {deletingSectionId === section.id ? <SpinnerIcon /> : <TrashIcon />}
                      </button>
                      <button
                        type="button"
                        className="pagesIconBtn pagesIconBtnNew"
                        onClick={() => triggerNewImageFile(section.id)}
                        disabled={uploadingSectionId === section.id}
                        title="Add image"
                        aria-label={`Add image to ${section.section_name}`}
                      >
                        {uploadingSectionId === section.id ? <SpinnerIcon /> : <ImagePlusIcon />}
                      </button>
                      <input
                        ref={(el) => {
                          newImageFileInputs.current[section.id] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="cmsHiddenFile"
                        onChange={(e) => void onNewImageFileSelected(section.id, e)}
                      />
                    </div>
                  </div>

                  <div className="cmsSectionBody">
                    {hasImages ? (
                      <>
                        <div className="cmsTableScroll">
                          <table className="cmsImageRowsTable">
                            <thead>
                              <tr>
                                <th className="cmsImgColPreview">Preview</th>
                                <th className="cmsImgColPath">Storage path</th>
                                <th className="cmsImgColStatus">Status</th>
                                <th className="cmsImgColActions">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {imgs.map((img) => (
                                <tr
                                  key={img.id}
                                  className={img.status === false ? "cmsImageRowInactive" : undefined}
                                >
                                  <td className="cmsImgCellPreview">
                                    <div className="cmsThumbWrap cmsThumbWrapRow">
                                      <CmsImagePreview
                                        storedPath={img.image_url}
                                        compact
                                        onOpenPreview={setImageLightboxUrl}
                                      />
                                    </div>
                                  </td>
                                  <td className="cmsImgCellPath">
                                    <code className="cmsImagePathCode cmsImagePathCodeInline">{img.image_url}</code>
                                    <div className="cmsMeta">
                                      ID {img.id} · {new Date(img.updated_time).toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="cmsImgCellStatus">
                                    <div className="cmsStatusRow">
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={img.status !== false}
                                        aria-label={img.status === false ? "Activate image" : "Deactivate image"}
                                        className={`cmsStatusToggle${img.status === false ? "" : " cmsStatusToggleOn"}`}
                                        onClick={() => void handleToggleImageStatus(img)}
                                        disabled={togglingStatusImageId === img.id}
                                      >
                                        <span className="cmsStatusToggleTrack">
                                          <span className="cmsStatusToggleThumb" />
                                        </span>
                                      </button>
                                      <span
                                        className={
                                          img.status === false ? "cmsStatusLabel cmsStatusLabelOff" : "cmsStatusLabel"
                                        }
                                      >
                                        {togglingStatusImageId === img.id
                                          ? "…"
                                          : img.status === false
                                            ? "Inactive"
                                            : "Active"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="cmsImgCellActions">
                                    <div className="cmsImgActionsRow">
                                      <button
                                        type="button"
                                        className="pagesIconBtn pagesIconBtnEdit"
                                        onClick={() => triggerReplaceImageFile(img.id)}
                                        disabled={updatingImageId === img.id}
                                        title="Replace image"
                                        aria-label={`Replace image ${img.id}`}
                                      >
                                        {updatingImageId === img.id ? <SpinnerIcon /> : <ImageUploadIcon />}
                                      </button>
                                      <input
                                        ref={(el) => {
                                          replaceImageFileInputs.current[img.id] = el;
                                        }}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="cmsHiddenFile"
                                        onChange={(e) => void onReplaceImageFileSelected(img, e)}
                                      />
                                      <button
                                        type="button"
                                        className="pagesIconBtn pagesIconBtnDelete"
                                        onClick={() => void handleDeleteImage(img)}
                                        disabled={deletingImageId === img.id}
                                        title="Delete image"
                                        aria-label={`Delete image ${img.id}`}
                                      >
                                        {deletingImageId === img.id ? <SpinnerIcon /> : <TrashIcon />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="cmsTextareaBlock cmsTextareaBlockSection cmsKvBlockBelowImages">
                          <p className="cmsCellHint">
                            Add each piece like title in the first box and your real headline (or paragraph, phone
                            number, etc.) in the second—the same idea as writing “title: your actual title text”. Leave
                            the first box empty on a row if you don’t want that row saved.
                          </p>
                          <SectionContentKeyValueEditor
                            pairs={contentDrafts[section.id] ?? [newSectionContentPair()]}
                            onPairsChange={(next) =>
                              setContentDrafts((d) => ({ ...d, [section.id]: next }))
                            }
                            disabled={savingSectionId === section.id}
                          />
                          <button
                            type="button"
                            className="cmsBtnPrimarySm"
                            onClick={() => void saveSectionContent(section)}
                            disabled={savingSectionId === section.id}
                          >
                            {savingSectionId === section.id ? "Saving…" : "Save content"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="cmsTextareaBlock cmsTextareaBlockSection">
                        <p className="cmsCellHint">
                          Use the first box for what you’re naming (e.g. title) and the second for the words visitors
                          should see (your real title, blurb, etc.). Use the picture icon in the bar to add images—you can
                          keep editing these fields afterward.
                        </p>
                        <SectionContentKeyValueEditor
                          pairs={contentDrafts[section.id] ?? [newSectionContentPair()]}
                          onPairsChange={(next) =>
                            setContentDrafts((d) => ({ ...d, [section.id]: next }))
                          }
                          disabled={savingSectionId === section.id}
                        />
                        <button
                          type="button"
                          className="cmsBtnPrimarySm"
                          onClick={() => void saveSectionContent(section)}
                          disabled={savingSectionId === section.id}
                        >
                          {savingSectionId === section.id ? "Saving…" : "Save content"}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <form className="cmsAddSection" onSubmit={handleAddSection}>
        <h2 className="cmsAddTitle">Add section</h2>
        <div className="cmsAddRow">
          <label className="cmsLabel">
            Name
            <input
              className="cmsInput"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. hero"
              disabled={!page || addingSection}
            />
          </label>
        </div>
        <div className="cmsLabel cmsLabelBlock">
          <span>Initial content (optional)</span>
          <p className="cmsCellHint cmsCellHintTight">
            One row per item: left = a short name (e.g. title), right = the real text (e.g. your actual headline). Add
            more with “Add another field”. Rows with nothing in the left box are skipped when you save.
          </p>
          <SectionContentKeyValueEditor
            pairs={newSectionPairs}
            onPairsChange={setNewSectionPairs}
            disabled={!page || addingSection}
          />
        </div>
        <button type="submit" className="cmsBtnPrimary" disabled={!page || addingSection}>
          {addingSection ? "Adding…" : "Add section"}
        </button>
      </form>

      {imageLightboxUrl ? (
        <div
          className="cmsImageLightboxBackdrop"
          role="presentation"
          onMouseDown={() => setImageLightboxUrl(null)}
        >
          <div
            className="cmsImageLightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="cmsImageLightboxClose"
              onClick={() => setImageLightboxUrl(null)}
              aria-label="Close preview"
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- resolved CMS media URL */}
            <img src={imageLightboxUrl} alt="" className="cmsImageLightboxImg" />
            <a
              className="cmsImageLightboxOpenTab"
              href={imageLightboxUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
          </div>
        </div>
      ) : null}

      {editSection ? (
        <div className="pagesModalBackdrop" role="presentation" onMouseDown={() => setEditSection(null)}>
          <div
            className="pagesModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-rename-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-rename-title" className="pagesModalTitle">
              Update section
            </h2>
            <label className="pagesModalLabel" htmlFor="cms-rename-input">
              Section name
            </label>
            <input
              id="cms-rename-input"
              className="pagesModalInput"
              value={editSectionName}
              onChange={(e) => setEditSectionName(e.target.value)}
              disabled={savingSectionMeta}
            />
            <div className="pagesModalFooter">
              <button type="button" className="dashboardBtnGhost" onClick={() => setEditSection(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="pagesModalSave"
                onClick={() => void saveSectionRename()}
                disabled={savingSectionMeta}
              >
                {savingSectionMeta ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {leaveConfirm ? (
        <div
          className="pagesModalBackdrop"
          role="presentation"
          style={{ zIndex: 220 }}
          onMouseDown={() => setLeaveConfirm(null)}
        >
          <div
            className="pagesModal pagesModalWide"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cms-unsaved-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="cms-unsaved-title" className="pagesModalTitle">
              Unsaved section content
            </h2>
            {leaveConfirm.sectionTitles.length > 0 ? (
              <>
                <p className="pagesModalBodyText">This content is not saved yet for:</p>
                <ul className="pagesModalUnsavedList">
                  {leaveConfirm.sectionTitles.map((t, i) => (
                    <li key={`${i}-${t}`}>{t}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {leaveConfirm.addForm ? (
              <p className="pagesModalBodyText">
                You have unsaved entries in Add section (name or content fields).
              </p>
            ) : null}
            <p className="pagesModalBodyText">OK stays on this page so you can press Save content. Continue anyway leaves
              without saving.</p>
            <div className="pagesModalFooter">
              <button type="button" className="dashboardBtnGhost" onClick={handleLeaveConfirmDiscard}>
                Continue anyway
              </button>
              <button type="button" className="pagesModalSave" onClick={handleLeaveConfirmStay}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
      {contentSavedToast
        ? createPortal(
            <div
              key={contentSavedToast.key}
              className={`cmsContentSavedToast${contentSavedToast.exiting ? " cmsContentSavedToastExiting" : ""}`}
              role="status"
              aria-live="polite"
            >
              Content saved
            </div>,
            document.body
          )
        : null}
    </>
  );
}
