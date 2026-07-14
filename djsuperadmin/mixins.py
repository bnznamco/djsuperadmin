class DjSuperAdminMixin:
    @property
    def superadmin_get_url(self):
        raise NotImplementedError("You must define superadmin_get_url!")

    @property
    def superadmin_patch_url(self):
        raise NotImplementedError("You must define superadmin_patch_url!")

    @property
    def superadmin_history_url(self):
        # Optional: return a URL that GETs {"versions": [...]} to enable the
        # editor's revert/history panel. None -> no history button is shown.
        return None
