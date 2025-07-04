# Tailwind 4 vs Tailwind 3: Key Differences and Improvements

If you’ve worked with Tailwind CSS before, you’ll know how powerful v3 was — but v4 changes the game in all the right ways. Whether chasing faster build times, cleaner theming, or just wanting fewer configuration headaches, Tailwind v4 brings smart, CSS-first improvements that save time and boost flexibility.

In this quick comparison, we’ll explain exactly what’s new, what’s better, and why it matters to your workflow. If you're thinking about upgrading (or just starting fresh), this guide will help you decide if Tailwind 4 is worth the switch — and spoiler: it probably is.

Here's a more detailed breakdown of the key differences:

1. CSS-First Configuration:
Tailwind v3:

mainly, the tailwind.config.js JavaScript configuration file was used to define the theme and custom tools.  

Tailwind v4:

adopts a more CSS-first methodology, enabling you to use the @theme directive and CSS variables to define your theme and custom utilities directly in CSS. This provides more flexibility and facilitates integration with current CSS workflows.

2. Dynamic Utility Values:
Tailwind v3:

Needed to use square bracket notation for custom values or define utility values in the configuration file.

Tailwind v4:

With Tailwind v4, you can use any value without having to define it beforehand thanks to the introduction of dynamic utility values. For instance, rather than depending on fixed values like w-96 or w-md, you can use w-103 for width, which is directly tied to the spacing scale. 

3. Simplified Theme Configuration:
Tailwind v3:

Required specifying the number of columns for grid layouts and Z-index values in the configuration file for Tailwind v3.

Tailwind v4:

Tailwind v4 lets you directly specify the number of columns (e.g., grid-cols-15) and Z-index values (e.g., z-40) in your HTML without clear config file setup.

4. Performance and Build Speed:
Tailwind v3: 

Had a bigger engine size and slower build times. 

Tailwind v4: 

Using CSS variables and other optimizations, it has a smaller engine size and much quicker build times, particularly for incremental builds.

5. Automatic Content Detection:
Tailwind v3:

Required manual configuration of the content array in the configuration file to specify files for scanning.

Tailwind v4:

 Automatically scans files, ignoring typical files like those in .gitignore and those with common extensions like images and videos.

6. Enhanced Gradients and 3D Transforms
Tailwind v3: 

lacked integrated support for radial and conic gradients, but it did support basic linear gradients and 2D transforms (such as rotate, scale, and translate). Additionally, 3D transform tools were not included.

Tailwind v4: 

Offers sophisticated gradient tools for conic, radial, and linear gradients, increasing your design freedom right out of the box. More dynamic and immersive user interface effects are made possible by the addition of 3D transform tools like rotate-x-*, rotate-y-*, and scale-z-*.

7. Modern CSS Features
Tailwind v3:

Limited integration with more recent syntax and contemporary CSS APIs. Utility classes either didn't support features like @starting-style, @property, and color-mix() or needed to be manually implemented.

Tailwind v4:
Tailwind v4 gives developers more power and control right within their utility-first workflow by supporting state-of-the-art CSS features like @starting-style for smoother animations, color-mix() for dynamic color blending, and @property for defining custom CSS properties with type safety.

8. Simplified Setup:
Tailwind v3:

In order to import and add vendor prefixes, external tools such as postcss-import and autoprefixer are needed. 

Tailwind v4:

Reduces the need for external plugins and streamlines setup by handling these tasks internally.

9. Improved Developer Experience with Arbitrary Properties
Tailwind v3:
Square bracket notation was used to support arbitrary values; however, properties were restricted to predefined utility categories (e.g., w-[103px], bg-[#123456]).

Tailwind v4:
Builds upon this by permitting arbitrary properties in addition to values. Now, you can use style-[property:value] syntax to write custom styles directly within your HTML, like this:

<div class="style-[scroll-snap-align:start]">
Because of this, Tailwind can support CSS properties that are either uncommon or state-of-the-art without having to wait for core utility support.

10. Native Support for CSS Nesting
Tailwind v3:
To use native CSS nesting within custom styles, either manual setup or plugins are needed.

Tailwind v4:
Offers excellent support for CSS nesting with contemporary syntax, which improves the readability and maintainability of authoring styles in layered component files.

11. Container Queries for Responsive Design
Tailwind v3:
Only screen size breakpoints were used to determine responsiveness; container queries were not supported.

Tailwind v4:
With Tailwind v4, components can now adjust according to their parent size instead of the viewport thanks to support for container queries (@container). This helps create UIs that are more adaptable and modular.

12. Improved Colour and Theming System
Tailwind v3:
Color palettes were defined using a centralized theme configuration.

Tailwind v4:
Reduces build size, enables dynamic theme switching, and enhances runtime performance by using CSS variables for theming. With little setup, you can now create custom themes or light/dark modes.

13. Updated Plugin Ecosystem
Tailwind v3:

had a strong ecosystem of plugins, but a lot of them relied on the configuration system based on JavaScript. Using custom plugins to extend Tailwind frequently required a deeper understanding of PostCSS plugins and the configuration file structure.  

Tailwind v4: 

Numerous community and official plugins have been redesigned or updated to conform to the new CSS-first architecture. Plugins are now more powerful and simpler to integrate thanks to features like CSS variables, dynamic utility values, and the new @theme directive. This development improves compatibility and enables programmers to create plugins that feel more in line with Tailwind's contemporary style.

14. Backwards Compatibility and Migration
The Tailwind team offers a migration guide and code modifications to facilitate the switch from version 3 to version 4, even though version 4 brings about some significant changes.

15. No More tailwind.config.js file
One of the major simplifications in Tailwind CSS v4 is the removal of the default tailwind.config.js file. In previous versions (like v3), a tailwind.config.js file was typically generated to customize your Tailwind setup. 

In v4, Tailwind works out of the box using smart defaults — no config file necessary unless you need customization.