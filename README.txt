# Decap CMS starter (для статичных страниц)

Цель: оставить верстку 1:1, а контент (тексты/картинки/видео/ссылки) редактировать через /admin.

## Что внутри
- index.html — твоя страница + подключен assets/content-loader.js
- content/page.json — контент (пример)
- /admin — Decap CMS (config.yml + index.html)
- assets/uploads — сюда будут загружаться картинки из админки (создастся автоматически)

## Как привязать поля к верстке (без изменения внешнего вида)
Нужно добавить атрибут data-cms к элементам, которые должны подтягивать контент.

Примеры (идея):
- Заголовок: <h1 data-cms="hero.title">...</h1>
- Подзаголовок: <div data-cms="hero.subtitle">...</div>
- Картинка: <img data-cms="hero.image" ...>
- Кнопка-ссылка: <a data-cms="hero.ctaLink" ...>Текст кнопки оставь как есть или вынеси отдельно</a>
- Видео iframe: <iframe data-cms="hero.videoUrl" ...></iframe>

Повторяющиеся элементы (карточки/FAQ) — опционально:
- контейнер: data-cms-list="faq.items"
- внутри скрытый шаблон-элемент: data-cms-item-template
- элементы внутри шаблона: data-cms-item="question" / data-cms-item="answer"

## Как запустить с админкой (самый простой способ)
Рекомендуется Netlify:
1) Залей этот проект в GitHub (репозиторий).
2) Подключи репозиторий в Netlify (New site from Git).
3) В Netlify включи Identity + Git Gateway:
   - Site settings → Identity → Enable
   - Services → Git Gateway → Enable
4) Пригласи пользователя (Identity → Invite users).
5) Админка будет доступна по /admin

После этого изменения в /admin будут сохраняться в репозиторий и сразу попадать на сайт.

## Дальше
Для 6 страниц:
- сделай 6 файлов в content/: home.json, about.json, ...
- в admin/config.yml добавь их как отдельные files (копипастой)
- на каждой странице добавь meta:
  <meta name="cms-content" content="/content/home.json">
