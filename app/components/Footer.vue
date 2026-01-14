<script lang="ts" setup></script>

<template>
  <footer class="bg-cf-blue-dark text-white font-lato">
    <div
      class="container py-16 px-5 xl:px-0 mx-auto max-w-7xl flex flex-col justify-center lg:flex-row lg:justify-between gap-16 lg:gap-16"
    >
      <div
        class="w-full flex flex-col item-center text-white gap-8 mt-2 lg:max-w-[45%] 2xl:max-w-[40%] text-sm lg:text-base"
      >
        <div class="flex gap-4">
          <img
            src="@/assets/img/icon/vets-icon.png"
            alt="sarva ubund"
            class="w-14 h-14 object-contain"
          />
          <div class="">
            <p class="text-2xl font-paytone font-bold">Captain Fauna</p>
            <p class="">For Pets, By Vets</p>
          </div>
        </div>
        <p class="text-white/70">
          Expert veterinary advice you can trust. A collaboration between
          Captain Fauna and PDHI.
        </p>
        <ul class="flex gap-8 items-center">
          <li class="">
            <NuxtLink to="#">
              <img
                src="@/assets/img/icon/ig-white.png"
                alt="instagram"
                class="h-7.5 w-7.5 aspect-square"
              />
            </NuxtLink>
          </li>
          <li class="">
            <NuxtLink to="#">
              <img
                src="@/assets/img/icon/fb-white.png"
                alt="instagram"
                class="h-7.5 w-7.5 aspect-square"
              />
            </NuxtLink>
          </li>
          <li class="">
            <NuxtLink to="#">
              <img
                src="@/assets/img/icon/yt-white.png"
                alt="instagram"
                class="h-9 w-9 aspect-square"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="grid grid-cols-2 w-full"></div>
    </div>

    <p class="mx-auto text-center pt-6 pb-10 font-medium font-sans">
      © Copyright 2026 Captain Fauna. All rights reserved.
    </p>
  </footer>
</template>
