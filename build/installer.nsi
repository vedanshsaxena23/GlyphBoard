!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to permanently delete your encrypted GlyphBoard vault, cryptographic salts, and local data?" IDNO skip_purge
    RMDir /r "$APPDATA\glyphboard"
  skip_purge:
!macroend