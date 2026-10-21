<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep preset participants in a shared browser-safe data module and initialize the editable admin list from it; this ensures the supplied roster is available immediately without a server dependency.
- Keep countdown name animations in a presentation-only component; the animation must not influence random pair selection or used-participant tracking.
