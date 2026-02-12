"use client";

import { Provider } from "@/lib/context";
import { Detail } from "@/components/Detail";
import { Search } from "@/components/Search";
import { Tree } from "@/components/Tree";

const Home = () => {
  return (
    <Provider>
      <Search />
      <section className="contentGrid">
        <section className="treePanel">
          <h2>Taxonomy tree</h2>
          <Tree />
        </section>
        <section className="detailsPanel">
          <h2>Node details</h2>
          <Detail />
        </section>
      </section>
    </Provider>
  );
};

export default Home;
